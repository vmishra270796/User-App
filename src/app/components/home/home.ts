import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  detailsForm: FormGroup;
  submittedDetails: any = null;
  selectedFile: File | null = null;
  fileError: string | null = null;
  isEditMode = false; // Flag to track if we are editing
  currentUserId: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private route: ActivatedRoute, 
    private router: Router,private toastr: ToastrService) {
    this.detailsForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', Validators.required],
      address: ['', Validators.required],
      skills: ['', Validators.required],
      hobbies: ['', Validators.required],
      photo: [null]
    });
  }

  ngOnInit(): void {
     this.route.queryParams.subscribe(params => {
    if (params['id']) {
      this.isEditMode = true;
      this.currentUserId = params['id'];
      // Fetch the user data and populate the form
      this.authService.getUserById(this.currentUserId!).subscribe((user) => {
        this.detailsForm.patchValue({
          name: user.name,
          mobile: user.mobile,
          address: user.address,
          skills: user.skills ? user.skills.join(', ') : '',
          hobbies: user.hobbies ? user.hobbies.join(', ') : '',
        });
      });
    } 
    // else {
    //   this.authService.currentUser.subscribe((user) => {
    //     if (user && user.name) {
    //       // Check if user and user.name exists
    //       this.submittedDetails = user;
    //       this.detailsForm.patchValue({
    //         name: user.name,
    //         mobile: user.mobile,
    //         address: user.address,
    //         skills: user.skills ? user.skills.join(', ') : '',
    //         hobbies: user.hobbies ? user.hobbies.join(', ') : '',
    //       });
    //     }
    //   });
    // }
  })
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
        this.fileError = null;
      } else {
        this.selectedFile = null;
        this.fileError = 'Invalid file type. Please upload an image (png, jpg) or a PDF.';
        const photoControl = this.detailsForm.get('photo');
        if (photoControl) {
            photoControl.reset();
        }
      }
    }
  }

  onSubmit(): void {
    if (this.detailsForm.invalid) {
      return;
    }

    const formData = new FormData();
    Object.keys(this.detailsForm.controls).forEach(key => {
        if (key !== 'photo') {
            const control = this.detailsForm.get(key);
            if (control) {
                formData.append(key, control.value);
            }
        }
    });
    
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    }
    
    if (this.isEditMode) {
      this.authService.updateUserById(this.currentUserId!, formData).subscribe(() => {
        this.toastr.success('Details updated successfully!');
        this.router.navigate(['/users']);
      });
    } else {
      this.authService.createUserDetails(formData).subscribe((data) => {
        this.toastr.success('Details submitted successfully!');
        this.submittedDetails = data;
        // this.router.navigate(['/users']);
      });
    }
  }
}