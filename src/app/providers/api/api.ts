import { Injectable } from '@angular/core';

import {Subject, Observable} from 'rxjs';


@Injectable()
export class ApiProvider {
  private clearSearchSubscription= new Subject<boolean>();

  constructor(){}

  clearSearchWatch(): Observable<any> {
    return this.clearSearchSubscription.asObservable();
  }

  clearSearch(){
    this.clearSearchSubscription.next(true);
  }


}
