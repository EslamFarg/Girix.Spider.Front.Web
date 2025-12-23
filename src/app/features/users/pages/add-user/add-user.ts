import { Component } from '@angular/core';
import { UsersNav } from "../../components/users-nav/users-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { UserForm } from "../../components/user-form/user-form";

@Component({
  selector: 'app-add-user',
  imports: [UsersNav, SectionWrapper, UserForm],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
})
export class AddUser {

}
