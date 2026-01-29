import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './component/pages/home/home.component';
import { DashbordComponent } from './component/pages/dashbord/dashbord.component';
import { LoginComponent } from './component/pages/auth/login/login.component';
import { RegisterComponent } from './component/pages/auth/register/register.component';
import { InventoryComponent } from './component/pages/inventory/inventory.component';
import { ReportsComponent } from './component/pages/reports/reports.component';


export const routes: Routes = [
    {   path: '', component: HomeComponent},
    {   path: 'dashboard', 
        canActivate: [AuthGuard],
        component: DashbordComponent},
    {   path: 'inventory',
        canActivate: [AuthGuard], 
        component: InventoryComponent},
    {   path: 'reports',
        canActivate: [AuthGuard],
        component: ReportsComponent},
    {   path: 'login', component: LoginComponent},
    {   path: 'register', component: RegisterComponent}
];
