import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  private isAuthCheckFinished = new BehaviorSubject<boolean>(false);
  public isAuthCheckFinished$ = this.isAuthCheckFinished.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus().subscribe();
  }
  register(credentials: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, credentials, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          // After successful registration, the backend automatically logs the user in
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
    });
  }

  checkAuthStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/check`, { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((err) => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        return of(null);
      }),
      finalize(() => {
        this.isAuthCheckFinished.next(true);
      })
    );
  }

  createUserDetails(formData: FormData): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/user/createUser`, formData, { withCredentials: true })
      .pipe(
        tap((user) => {
          // this.currentUserSubject.next(user);
        })
      );
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/all`, { withCredentials: true });
  }

  getUsersAsCsv(): Observable<{ csvData: string }> {
    return this.http.get<{ csvData: string }>(`${this.apiUrl}/user/export-csv`, {
      withCredentials: true,
    });
  }
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${id}`, { withCredentials: true });
  }

  updateUserById(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/${id}`, formData, { withCredentials: true });
  }

  getSingleUserAsCsv(id: string): Observable<{ csvData: string }> {
    return this.http.get<{ csvData: string }>(`${this.apiUrl}/user/${id}/export-csv`, {
      withCredentials: true,
    });
  }
  deleteUserById(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/${id}`, { withCredentials: true });
  }
}
