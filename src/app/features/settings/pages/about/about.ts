import { Component } from '@angular/core';
import { ProgramNav } from "../../components/program-nav/program-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-about',
  imports: [ProgramNav, SectionWrapper],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {

}
