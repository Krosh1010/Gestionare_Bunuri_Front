import { Routes } from '@angular/router';
import { HomeComponent } from './component/pages/home/home.component';
import { DashbordComponent } from './component/pages/dashbord/dashbord.component';
import { LoginComponent } from './component/pages/auth/login/login.component';
import { RegisterComponent } from './component/pages/auth/register/register.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'dashboard', component: DashbordComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent}
];
