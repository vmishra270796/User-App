import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  isDownloading = false;
  userToDeleteId: string | null = null;
  userToDeleteName: string | null = null;
  currentPage = 1;
  totalPages = 0;
  totalUsers = 0;
  limit = 2;
  constructor(private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers(this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        this.users = response.users;
        this.totalPages = response.totalPages;
        this.totalUsers = response.totalUsers;
      },
      error: (err) => {
        this.toastr.error('Failed to fetch users.', 'Error');
        console.error('Failed to fetch users', err);
      },
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  downloadCSV(): void {
    if (this.isDownloading) {
      return;
    }
    this.isDownloading = true;

    this.authService.getUsersAsCsv().subscribe({
      next: (response) => {
        const blob = new Blob([response.csvData], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'user_details.csv');
        this.isDownloading = false;
      },
      error: (err) => {
        this.toastr.error('Could not download user data.');
        this.isDownloading = false;
      },
    });
  }

  downloadSingleCSV(userId: string, userName: string): void {
    if (this.isDownloading) return;
    this.isDownloading = true;

    this.authService.getSingleUserAsCsv(userId).subscribe({
      next: (response) => {
        const safeName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(
          new Blob([response.csvData], { type: 'text/csv;charset=utf-8' }),
          `${safeName}_details.csv`
        );
        this.isDownloading = false;
      },
      error: (err) => {
        this.toastr.error('Could not download user data.');
        this.isDownloading = false;
      },
    });
  }

  openDeleteConfirm(user: any): void {
    this.userToDeleteId = user._id;
    this.userToDeleteName = user.name;
    console.log(`User to delete: ${this.userToDeleteName} (${this.userToDeleteId})`);
  }

  confirmDelete(): void {
    if (!this.userToDeleteId) {
      return;
    }

    this.authService.deleteUserById(this.userToDeleteId).subscribe({
      next: (response) => {
        this.toastr.success(response.msg || 'User deleted successfully.');
        this.users = this.users.filter((user) => user._id !== this.userToDeleteId);
        this.clearDeleteInfo();
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        this.toastr.error('Could not delete the user. Please try again.');
        this.clearDeleteInfo();
      },
    });
  }

  private clearDeleteInfo(): void {
    this.userToDeleteId = null;
    this.userToDeleteName = null;
  }
}
