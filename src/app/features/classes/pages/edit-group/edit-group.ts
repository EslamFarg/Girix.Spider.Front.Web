import { Component } from '@angular/core';
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { Button } from "primeng/button";
import { GroupForm } from "../../components/group-form/group-form";

@Component({
  selector: 'app-edit-group',
  imports: [GroupsNav, SectionWrapper, Button, GroupForm],
  templateUrl: './edit-group.html',
  styleUrl: './edit-group.css',
})
export class EditGroup {

}
