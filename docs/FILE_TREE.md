# Project File Tree

This document provides an overview of the project's directory structure.

```
.
├── Contributions-README.md
├── README.md
├── configs
│   └── nginx.conf
├── dev-scripts.md
├── docker
│   ├── Dockerfile
│   ├── docker-compose-local-stack.yaml
│   ├── docker-compose-local.yaml
│   ├── docker-compose-prod-2.yml
│   └── docker-compose-prod.yml
├── docs
│   ├── DEPLOYMENT.md
│   ├── DEVELOPER_GUIDE.md
│   ├── FILE_TREE.md
│   ├── USER_GUIDE.md
│   └── index.md
├── entrypoint-old.sh
├── entrypoint.sh
├── env
│   ├── .env
│   ├── .env.development
│   └── .env.production
├── index.html
├── nginx-was-working.conf
├── nginx.conf
├── package-lock.json
├── package.json
├── public
│   └── favicon.PNG
├── src
│   ├── App-old.vue
│   ├── App-test.vue
│   ├── App.vue
│   ├── api-orig.js
│   ├── api.js
│   ├── apiv2orig.js
│   ├── assets
│   │   ├── Gifs
│   │   │   └── rick-roll.gif
│   │   ├── Images
│   │   │   ├── Backgrounds
│   │   │   │   ├── hero-background.jpeg
│   │   │   │   ├── paralax-imgae.jpg
│   │   │   │   └── paralax-stars.jpg
│   │   │   ├── Defaults
│   │   │   │   ├── default-car-image.png
│   │   │   │   └── default-user-avatar.png
│   │   │   ├── Logo
│   │   │   │   ├── OntheGoRentals-Logo-Round-Clear.PNG
│   │   │   │   └── logo.svg
│   │   │   └── services
│   │   │       ├── economy.jpg
│   │   │       ├── luxury.jpg
│   │   │       └── special.jpg
│   │   └── Styles
│   │       ├── styles-original.css
│   │       └── styles.css
│   ├── checkLoginState.js
│   ├── components
│   │   ├── Admin
│   │   │   ├── About
│   │   │   │   ├── AboutUsManagement.vue
│   │   │   │   ├── CreateAboutUs.vue
│   │   │   │   ├── DeleteAboutUs.vue
│   │   │   │   ├── UpdateAboutUs.vue
│   │   │   │   └── ViewAboutUs.vue
│   │   │   ├── AdminDash.vue
│   │   │   ├── AdminPage-old.vue
│   │   │   ├── AdminPage.vue
│   │   │   ├── AdminSidebar.vue
│   │   │   ├── AdminView.vue
│   │   │   ├── Booking
│   │   │   │   ├── BookingManagement.vue
│   │   │   │   ├── CreateBooking.vue
│   │   │   │   └── ViewBooking.vue
│   │   │   ├── Car
│   │   │   │   ├── CarManagment.vue
│   │   │   │   ├── CreateCar.vue
│   │   │   │   ├── DeleteCar.vue
│   │   │   │   ├── SelectCar.vue
│   │   │   │   ├── UpdateCar.vue
│   │   │   │   └── ViewCar.vue
│   │   │   ├── Charts
│   │   │   │   ├── CarUseChart.vue
│   │   │   │   ├── PieChart.vue
│   │   │   │   ├── RentalChart.vue
│   │   │   │   ├── RentalDurations.vue
│   │   │   │   └── StorageUsageChart.vue
│   │   │   ├── ContactUs
│   │   │   │   ├── ContactUsManagement.vue
│   │   │   │   ├── CreateContactUs.vue
│   │   │   │   ├── DeleteContactUs.vue
│   │   │   │   ├── UpdateContactUs.vue
│   │   │   │   └── ViewContactUs.vue
│   │   │   ├── DamageReport
│   │   │   │   ├── CreateDamageReport.vue
│   │   │   │   ├── DamageReportManagement.vue
│   │   │   │   ├── DeleteDamageReport.vue
│   │   │   │   ├── UpdateDamageReport.vue
│   │   │   │   └── ViewDamageReport.vue
│   │   │   ├── Driver
│   │   │   │   ├── CreateDriver.vue
│   │   │   │   ├── DeleteDriver.vue
│   │   │   │   ├── DriverList.vue
│   │   │   │   ├── DriverManagement.vue
│   │   │   │   ├── SelectDriver.vue
│   │   │   │   ├── UpdateDriver.vue
│   │   │   │   └── ViewDriver.vue
│   │   │   ├── Faq
│   │   │   │   ├── CreateFaq.vue
│   │   │   │   ├── DeleteFaq.vue
│   │   │   │   ├── FaqManagement.vue
│   │   │   │   ├── UpdateFaq.vue
│   │   │   │   └── ViewFaq.vue
│   │   │   ├── FileManagement
│   │   │   │   └── FileManagement.vue
│   │   │   ├── HelpCenter
│   │   │   │   ├── CreateHelpCenter.vue
│   │   │   │   ├── DeleteHelpCenter.vue
│   │   │   │   ├── HelpCenterManagement.vue
│   │   │   │   ├── UpdateHelpCenter.vue
│   │   │   │   └── ViewHelpCenter.vue
│   │   │   ├── Rental
│   │   │   │   ├── ActiveRentalsManagement.vue
│   │   │   │   ├── CreateRental.vue
│   │   │   │   ├── ProcessReturn.vue
│   │   │   │   ├── RentalManagement-orig.vue
│   │   │   │   ├── RentalManagement.vue
│   │   │   │   └── ViewRental.vue
│   │   │   ├── Settings
│   │   │   │   └── Settings.vue
│   │   │   ├── StaffDailyOperations
│   │   │   │   └── StaffDailyOperations.vue
│   │   │   └── User
│   │   │       ├── CreateUser.vue
│   │   │       ├── DeleteUser.vue
│   │   │       ├── SelectUser.vue
│   │   │       ├── UpdateUser.vue
│   │   │       ├── UserList.vue
│   │   │       ├── UserManagement.vue
│   │   │       └── ViewUser.vue
│   │   └── Main
│   │       ├── About
│   │       │   ├── AboutUs.vue
│   │       │   └── ContactUs.vue
│   │       ├── Car
│   │       │   ├── CarDetail.vue
│   │       │   └── CarList.vue
│   │       ├── Carousel
│   │       │   └── Carousel.vue
│   │       ├── Driver
│   │       │   └── DriverList.vue
│   │       ├── General
│   │       │   ├── ErrorPage.vue
│   │       │   ├── Footer.vue
│   │       │   ├── Home.vue
│   │       │   ├── HomePage.vue
│   │       │   ├── SalesList.vue
│   │       │   └── TestPage.vue
│   │       ├── Help
│   │       │   ├── Faq.vue
│   │       │   ├── HelpCenter.vue
│   │       │   └── help-center-injection.js
│   │       ├── Loaders
│   │       │   ├── ShimmerAdminTable.vue
│   │       │   └── ShimmerCard.vue
│   │       ├── Modals
│   │       │   ├── ConfirmationModal.vue
│   │       │   ├── FailureModal.vue
│   │       │   ├── LoadingModal.vue
│   │       │   ├── LoadingModalSection.vue
│   │       │   └── SuccessModal.vue
│   │       ├── Navigation
│   │       │   ├── Navbar-new-orignial.vue
│   │       │   ├── Navbar-old.vue
│   │       │   ├── Navbar-user-role.vue
│   │       │   └── Navbar.vue
│   │       ├── Rental
│   │       │   ├── Booking
│   │       │   │   └── Booking.vue
│   │       │   ├── Rental.vue
│   │       │   └── ReturnRental.vue
│   │       └── User
│   │           ├── CustomerList.vue
│   │           ├── EditProfile.vue
│   │           ├── ForgotPassword.vue
│   │           ├── Login.vue
│   │           ├── MyBookings.vue
│   │           ├── OAuth2RedirectHandler.vue
│   │           ├── RentalHistory.vue
│   │           ├── ResetPassword.vue
│   │           ├── Signout.vue
│   │           ├── Signup.vue
│   │           └── UserProfile.vue
│   ├── enums
│   │   └── PriceGroup.js
│   ├── intercepter.js
│   ├── main.js
│   ├── router
│   │   ├── adminAboutUsRoutes.js
│   │   ├── adminBookingRoutes.js
│   │   ├── adminCarRoutes.js
│   │   ├── adminContactUsRoutes.js
│   │   ├── adminDamageReportRoutes.js
│   │   ├── adminDriverRoutes.js
│   │   ├── adminFaqRoutes.js
│   │   ├── adminHelpCenterRoutes.js
│   │   ├── adminRentalRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── adminUserRoutes.js
│   │   ├── carRoutes.js
│   │   ├── index.js
│   │   ├── navRoutes.js
│   │   └── router-2.js
│   ├── services
│   │   └── dashboardApi.js
│   ├── store
│   │   ├── currencyStore.js
│   │   └── store.js
│   └── utils
│       └── dateUtils.js
└── vite.config.js
```
