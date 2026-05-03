# task-1

## requirements:
1. add an edit icon similar to the ones in src\app\features\orders\pages\orders in each row

## locations:
1. src\app\features\refunds\pages\refunds

## notes:
1. the edit icon is a link the redirects to the edit refund page route at src\app\routes\invoices.ts

-------------------

# task-2

## requirements:
1. prepare the refund form to receive the refund id for editing.

## locations:
1. src\app\features\refunds\components\refund-form
2. src\app\features\refunds\pages\edit-refund
3. check the create/update refund type and see if it's setup with the needed controls and data

-------------------

# task-3

## requirements:
1. handle the refund form cash/network amounts inputs like cashier cash/network inputs which the total value is a must but the user can change how much to pay in each.

## locations:
1. src\app\features\orders\pages\cashier
2. src\app\features\refunds\components\refund-form

-------------------

# task-4

## requirements:
1. remove the change api url user options at login and in header
DAILY_JOURNAL.RESET_SHORTAGE

-------------------

# task-5

## requirements:
1. resetShortage submitting

## locations:
1. src\app\features\settings\pages\manage-daily-journal
2. src\app\features\settings\services\daily-journal-service.ts

## notes:
1. i added a reset method in the service which receives the user id on whom to reset the shortage so add a submit button.