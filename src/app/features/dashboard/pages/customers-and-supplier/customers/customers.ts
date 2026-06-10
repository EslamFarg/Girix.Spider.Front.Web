import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-customers',
  imports: [RouterOutlet],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers {}
