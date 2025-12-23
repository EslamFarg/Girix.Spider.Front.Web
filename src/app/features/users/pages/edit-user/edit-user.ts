import { Component } from '@angular/core';
import { UsersNav } from "../../components/users-nav/users-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { UserForm } from "../../components/user-form/user-form";

@Component({
  selector: 'app-edit-user',
  imports: [UsersNav, SectionWrapper, UserForm],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {

}
