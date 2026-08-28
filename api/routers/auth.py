from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.security import hash_password, verify_password, create_access_token, decode_access_token
from api.models.user import User
from api.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    ForgotPasswordQuestionRequest,
    ForgotPasswordQuestionResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Autentikasi"])


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Dependency to resolve the currently authenticated user if present, or None if guest.
    """
    user = None

    try:
        # 1. Try JWT Bearer Token
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("sub")
                if user_id:
                    user = db.query(User).filter(User.id == int(user_id)).first()

        # 2. Try X-User-Id Header
        if not user and x_user_id:
            try:
                user = db.query(User).filter(User.id == int(x_user_id)).first()
            except (ValueError, TypeError):
                pass

        # 3. Try X-User-Email Header
        if not user and x_user_email:
            user = db.query(User).filter(User.email == x_user_email.strip().lower()).first()
    except Exception:
        user = None

    return user


def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    """
    Strict dependency requiring the user to be authenticated.
    """
    user = get_current_user_optional(
        authorization=authorization,
        x_user_email=x_user_email,
        x_user_id=x_user_id,
        db=db,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Silakan login terlebih dahulu.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user with hashed password and optional security backup question.
    """
    clean_email = payload.email.strip().lower()
    
    # Check if email already registered
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{clean_email}' sudah terdaftar. Silakan login.",
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi minimal 6 karakter.",
        )

    hashed_pw = hash_password(payload.password)
    
    # Process security question & answer if provided
    security_question = payload.security_question.strip() if payload.security_question else None
    security_answer_hash = None
    if payload.security_answer and payload.security_answer.strip():
        # Normalize to lowercase before hashing for seamless, case-insensitive verification
        security_answer_hash = hash_password(payload.security_answer.strip().lower())

    new_user = User(
        name=payload.name.strip(),
        email=clean_email,
        password_hash=hashed_pw,
        security_question=security_question,
        security_answer_hash=security_answer_hash,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "name": new_user.name})

    return AuthResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        token=token,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and issue JWT access token.
    """
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi tidak cocok.",
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "name": user.name})

    return AuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        token=token,
    )


@router.post("/forgot-password/question", response_model=ForgotPasswordQuestionResponse)
def get_security_question(payload: ForgotPasswordQuestionRequest, db: Session = Depends(get_db)):
    """
    Retrieve security question for an account by email to begin password recovery.
    """
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Akun dengan email tersebut tidak ditemukan.",
        )

    if not user.security_question or not user.security_answer_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Akun ini belum menyetel pertanyaan keamanan pemulihan.",
        )

    return ForgotPasswordQuestionResponse(
        email=user.email,
        security_question=user.security_question,
    )


@router.post("/forgot-password/reset", response_model=ResetPasswordResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Verify security question answer and update user password.
    """
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not user.security_answer_hash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Akun tidak ditemukan atau tidak memiliki pertanyaan pemulihan.",
        )

    # Verify security answer (case-insensitive)
    normalized_answer = payload.security_answer.strip().lower()
    if not verify_password(normalized_answer, user.security_answer_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jawaban pertanyaan keamanan salah. Silakan coba lagi.",
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi baru minimal 6 karakter.",
        )

    # Update password
    user.password_hash = hash_password(payload.new_password)
    db.commit()

    return ResetPasswordResponse(
        status="success",
        message="Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.",
    )


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get profile of the currently authenticated user.
    """
    return current_user
