import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [DatePipe,RouterLink],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent {
  currentDate: Date = new Date();
}
