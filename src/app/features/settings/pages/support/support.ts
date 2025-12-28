import { Component } from '@angular/core';
import { ProgramNav } from "../../components/program-nav/program-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-support',
  imports: [ProgramNav, SectionWrapper],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support {

}
