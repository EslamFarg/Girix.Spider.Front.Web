import { Component } from '@angular/core';
import { ProgramNav } from "../../components/program-nav/program-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-language',
  imports: [ProgramNav, SectionWrapper],
  templateUrl: './language.html',
  styleUrl: './language.css',
})
export class Language {

}
