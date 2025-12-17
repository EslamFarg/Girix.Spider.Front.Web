import { Component } from '@angular/core';
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { Button } from "primeng/button";

@Component({
  selector: 'app-view-group',
  imports: [GroupsNav, SectionWrapper, Button],
  templateUrl: './view-group.html',
  styleUrl: './view-group.css',
})
export class ViewGroup {

}
