from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.security import hash_password, verify_password, create_access_token, decode_access_token
from api.models.user import User
from api.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Autentikasi"])


def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to resolve the currently authenticated user.
    Supports JWT Bearer Token, X-User-Email, or X-User-Id header.
    """
    user = None

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
    Register a new user with hashed password.
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

    hashed = hash_password(payload.password)
    new_user = User(
        name=payload.name.strip(),
        email=clean_email,
        password_hash=hashed,
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


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get profile of the currently authenticated user.
    """
    return current_user
