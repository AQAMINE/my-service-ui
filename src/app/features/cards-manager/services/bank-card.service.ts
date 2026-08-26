import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BankCard,
  BankSummary,
  CardProviderSummary,
  CreateCardRequest
} from '../models/bank-card';

@Injectable({
  providedIn: 'root'
})
export class BankCardService {
  private http = inject(HttpClient);
  private readonly cardsUrl = `${environment.cardsApiUrl}/v1/cards`;
  private readonly banksUrl = `${environment.cardsApiUrl}/v1/banks`;
  private readonly providersUrl = `${environment.cardsApiUrl}/v1/card-providers`;

  getCards(): Observable<BankCard[]> {
    return this.http.get<BankCard[]>(this.cardsUrl);
  }

  getBanks(): Observable<BankSummary[]> {
    return this.http.get<BankSummary[]>(this.banksUrl);
  }

  getProviders(): Observable<CardProviderSummary[]> {
    return this.http.get<CardProviderSummary[]>(this.providersUrl);
  }

  createCard(body: CreateCardRequest): Observable<BankCard> {
    return this.http.post<BankCard>(this.cardsUrl, body);
  }

  deleteCard(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.cardsUrl}/${cardId}`);
  }

  revealPan(cardId: string): Observable<{ pan: string }> {
    return this.http.get<{ pan: string }>(`${this.cardsUrl}/${cardId}/reveal-pan`);
  }

  revealCvv(cardId: string): Observable<{ cvv: string }> {
    return this.http.get<{ cvv: string }>(`${this.cardsUrl}/${cardId}/reveal-cvv`);
  }

  revealPin(cardId: string): Observable<{ pin: string }> {
    return this.http.get<{ pin: string }>(`${this.cardsUrl}/${cardId}/reveal-pin`);
  }
}
