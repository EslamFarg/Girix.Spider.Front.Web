import { NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Output } from '@angular/core';
import { AuthServices } from '../../../features/auth/services/auth-services';

@Component({
  selector: 'app-header',
  imports: [NgClass, NgStyle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

   // !!!!! Services 
 @Output() isShowSidebar = new EventEmitter(true);
 _authServices: AuthServices = inject(AuthServices);
// isShowSidebar = output<any>();

  // !!!!! Properties
  isShowUserDropDown = false;
  isSidebarOpen = false;
  isDark=false;
  isOpen = false;






  // !!!!! Methods

  ngOnInit(): void {
   
    const theme = localStorage.getItem('theme');
    const root=document.documentElement;
    if(theme === 'dark'){
      root.classList.add('dark-theme');
      this.isDark=true;
    }else{
      // this.themeColor();
      root.classList.remove('dark-theme');
      this.isDark=false;
    }
  }

  @HostListener('document:click', ['$event'])

  onDocumentClick(event: any) {
    const target = event.target.closest('.user-drop-down') as HTMLElement;
    const notification_drop_down = event.target.closest('.notification-drop-down') as HTMLElement;

    // console.log(target);
    if(!target){
      this.isShowUserDropDown = false;
    }
    if(!notification_drop_down){
      this.isOpen = false;
    }
  }



  toggleUserDropDown(){
    this.isShowUserDropDown = !this.isShowUserDropDown;

  }

  themeColor(){
    const root=document.documentElement;
    root.classList.toggle('dark-theme');
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');

  }

  ShowAndHideSidebar(){
    this.isSidebarOpen = !this.isSidebarOpen;
    this.isShowSidebar.emit(true);
  }

  // !!!! Notification Popup

  notifications:any = [
  {
    id: 1,
    title: 'طلب جديد',
    message: 'تم إنشاء فاتورة جديدة',
    time: 'منذ دقيقة',
    isRead: false
  },
  {
    id: 2,
    title: 'تم الدفع',
    message: 'تم استلام دفعة بنجاح',
    time: 'منذ 5 دقائق',
    isRead: true
  }
];



toggleNotifications() {
  this.isOpen = !this.isOpen;
}

get unreadCount() {
  return this.notifications.filter((n:any) => !n.isRead).length;
}

markAsRead(notification: any) {
  notification.isRead = true;
}

logout(){
  this._authServices.logout();
}

}
