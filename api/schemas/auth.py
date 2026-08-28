from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    security_question: Optional[str] = None
    security_answer: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    id: int
    name: str
    email: str
    token: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ForgotPasswordQuestionRequest(BaseModel):
    email: EmailStr


class ForgotPasswordQuestionResponse(BaseModel):
    email: str
    security_question: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    security_answer: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    status: str
    message: str
