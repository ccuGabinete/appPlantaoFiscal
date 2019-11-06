import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
const url = 'https://gcdapi.herokuapp.com/';
const local = 'http://localhost:3000/';

@Injectable({
  providedIn: 'root'
})
export class AutoService {
  public quantidade: number;
  public buscarQuantidade = new BehaviorSubject(this.quantidade);
  quantidadeAtual = this.buscarQuantidade.asObservable();

  constructor(private http: HttpClient) { }

  atualizarQuantidade(quantidade: number) {
    this.buscarQuantidade.next(quantidade);
  }

  contarAutos(): Observable<HttpResponse<any>> {
    return this.http.get<any>(local + 'gcd/autos/contar', { observe: 'response' })
      .pipe(
        catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
