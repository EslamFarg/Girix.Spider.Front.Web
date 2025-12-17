import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { Button } from "primeng/button";

@Component({
  selector: 'app-add-group',
  imports: [SectionWrapper, GroupsNav, Button],
  templateUrl: './add-group.html',
  styleUrl: './add-group.css',
})
export class AddGroup {

}
