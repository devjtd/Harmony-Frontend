import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  nombreCompleto?: string;
}

export interface UserInfo {
  email: string;
  role: string;
  nombreCompleto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  // Signal para el estado de autenticación
  public isAuthenticated = signal<boolean>(this.hasToken());
  
  // BehaviorSubject para el usuario actual
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    console.log('[AUTH SERVICE] Servicio de autenticación inicializado');
    console.log('[AUTH SERVICE] Usuario autenticado:', this.isAuthenticated());
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('[AUTH SERVICE] Iniciando proceso de login para:', credentials.email);

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('[AUTH SERVICE SUCCESS] Login exitoso');
        console.log('[AUTH SERVICE] Token recibido');
        console.log('[AUTH SERVICE] Rol del usuario:', response.role);
        
        // Guardar token y datos del usuario
        this.setToken(response.token);
        
        const userInfo: UserInfo = {
          email: response.email,
          role: response.role,
          nombreCompleto: response.nombreCompleto
        };
        
        this.setUserInfo(userInfo);
        this.currentUserSubject.next(userInfo);
        this.isAuthenticated.set(true);
        
        console.log('[AUTH SERVICE] Datos de usuario guardados en localStorage');
      }),
      catchError(error => {
        console.error('[AUTH SERVICE ERROR] Error en login:', error);
        console.error('[AUTH SERVICE ERROR] Status:', error.status);
        console.error('[AUTH SERVICE ERROR] Mensaje:', error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    console.log('[AUTH SERVICE] Cerrando sesión del usuario');
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    
    console.log('[AUTH SERVICE] Sesión cerrada, redirigiendo a login');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtiene el token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Guarda el token en localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtiene la información del usuario almacenada
   */
  getUserInfo(): UserInfo | null {
    return this.getUserFromStorage();
  }

  /**
   * Guarda la información del usuario en localStorage
   */
  private setUserInfo(user: UserInfo): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtiene el usuario desde localStorage
   */
  private getUserFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verifica si existe un token almacenado
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene los headers con el token de autenticación
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getUserInfo();
    return user ? user.role === role : false;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string | null {
    const user = this.getUserInfo();
    return user ? user.role : null;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Verifica si el usuario es cliente
   */
  isCliente(): boolean {
    return this.hasRole('ROLE_CLIENTE');
  }

  /**
   * Verifica si el usuario es profesor
   */
  isProfesor(): boolean {
    return this.hasRole('ROLE_PROFESOR');
  }

  /**
   * Redirige al usuario según su rol
   */
  redirectByRole(): void {
    const role = this.getUserRole();
    console.log('[AUTH SERVICE] Redirigiendo usuario con rol:', role);

    switch (role) {
      case 'ROLE_ADMIN':
        this.router.navigate(['/admin/estudiantes']);
        break;
      case 'ROLE_CLIENTE':
        this.router.navigate(['/estudiante/horario']);
        break;
      case 'ROLE_PROFESOR':
        this.router.navigate(['/profesor/horario']);
        break;
      default:
        console.warn('[AUTH SERVICE] Rol no reconocido:', role);
        this.router.navigate(['/']);
    }
  }
}