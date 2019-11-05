import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { DadosComponent } from './dados/dados.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoginService } from './services/acesso/login.service';
import { HomeComponent } from './home/home.component';

import { AppComponent } from './app.component';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AvisocamposService } from './services/avisocampos/avisocampos.service';
import { Avisocamposmodel } from './models/avisoscamposmodel/avisocamposmodel';
import { AvisocamposComponent } from './avisocampos/avisocampos.component';
import { LogadoService } from './services/logado/logado.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Usuario } from './models/usuario/usuario';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DadosComponent,
    HomeComponent,
    AvisocamposComponent
  ],
  imports: [
    GooglePlaceModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgbModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    LoginService,
    AvisocamposService,
    Avisocamposmodel,
    LogadoService,
    Usuario,
    MatDatepickerModule,
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'}
  ],
  bootstrap: [AppComponent],
  exports: [
    AvisocamposComponent
  ],
  entryComponents: [
    AvisocamposComponent
  ]

})
export class AppModule { }