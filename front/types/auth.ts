export interface SignUpRequest {
    user_email: string;
    password: string;
    user_name: string;
    role: "admin" | "hr" | "interviewer";
}

export interface LoginRequest {
    user_email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user_name: string;
}