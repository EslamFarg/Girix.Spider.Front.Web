# task-1

## requirements:
1. add a success modal when an order is created which shows the details and give the options to print or close

## locations:
1. src\app\features\orders\pages\cashier
2. src\app\features\orders\services\order-service.ts
3. src\app\features\printers\services\printer-service.ts
4. src\app\features\printers\components
5. src\app\features\orders\pages\orders\orders.ts

## notes:
1. the current printint logic in orders page kinda needs to change because i set the current order before printing, and the print method only takes the printer on which to print. i want to send both the printer and the item being printer in an oject.
2. update the print logic in the service then update every where it's used.
3. the order response below is returned when a creation is successful, you will see an item[], each item has it's own printer, so the print method should expect an array with each printer and it's printing data, the receipt in each should be the shared one or similar to src\app\features\printers\components\print-dialog, just optimize it to make it shared accross.

## response
{
    "id": 182,
    "invoiceNo": "2621000182",
    "orderNo": "1",
    "paymentType": 0,
    "dateTime": "2026-05-07T12:49:33.62Z",
    "orderType": 2,
    "customer": {
        "id": 0,
        "name": "عميل نقدي",
        "phone": null,
        "extraPhone": null,
        "email": null,
        "address": null
    },
    "place": null,
    "placeTransactions": [],
    "orderLogs": [],
    "items": [
        {
            "id": 452,
            "menuItemId": 26,
            "mealId": null,
            "name": "منتج جديد برجر",
            "qty": 1,
            "returnedQty": 0,
            "remainingQty": 1,
            "unitPrice": 86.956522,
            "selectiveTax": 86.956522,
            "netUnitPrice": 86.956522,
            "unitPriceWithTax": 200.0000006,
            "netUnitPriceWithTax": 200.0000006,
            "printer": {
                "id": 1,
                "name": "netwrok printer",
                "ipAddressOrMacAddress": "192.168.1.99",
                "port": 9100,
                "comPort": "",
                "type": 1
            },
            "modifiers": []
        },
        {
            "id": 453,
            "menuItemId": 49,
            "mealId": null,
            "name": "تشيز كيك ",
            "qty": 1,
            "returnedQty": 0,
            "remainingQty": 1,
            "unitPrice": 7.82608695652174,
            "selectiveTax": 0,
            "netUnitPrice": 7.82608695652174,
            "unitPriceWithTax": 9.000000000000002,
            "netUnitPriceWithTax": 9.000000000000002,
            "printer": {
                "id": 4,
                "name": "test network",
                "ipAddressOrMacAddress": "192.168.1.100",
                "port": 9100,
                "comPort": "",
                "type": 1
            },
            "modifiers": []
        },
        {
            "id": 454,
            "menuItemId": 50,
            "mealId": null,
            "name": "بيتزا تشيكن باربكيو",
            "qty": 1,
            "returnedQty": 0,
            "remainingQty": 1,
            "unitPrice": 160,
            "selectiveTax": 0,
            "netUnitPrice": 160,
            "unitPriceWithTax": 160,
            "netUnitPriceWithTax": 160,
            "printer": {
                "id": 3,
                "name": "Printer 1",
                "ipAddressOrMacAddress": "192.168.1.15",
                "port": 8080,
                "comPort": "",
                "type": 1
            },
            "modifiers": []
        }
    ],
    "summary": {
        "totalUnitPrice": 254.78260895652173,
        "discountAmount": 0,
        "discountPercentage": 0,
        "serviceFeeType": 2,
        "systemServiceFee": 5,
        "systemVat": 15,
        "totalSelectiveTax": 86.956522,
        "vatAmount": 27.260869643478262,
        "serviceFee": 0,
        "priceForPlace": 0,
        "durationMinutes": 0,
        "totalNet": 369.0000006,
        "netReturnOrder": 0
    },
    "payments": {
        "payingCash": 369.0000006,
        "payingNetwork": 0,
        "remaining": -1e-15
    },
    "toBePaid": {
        "beforeNetOrder": 0,
        "afterNetOrder": 0,
        "amount": 0
    },
    "settingResponse": {
        "nameAr": "مممممم",
        "nameEn": "hmmm",
        "phoneNumber": "88888888",
        "postalCode": "844848",
        "vatNumber": "1234567890",
        "commercialRegNo": "1234567890",
        "city": "الرياض",
        "district": "الجووووو",
        "buildingNumber": "7421",
        "logoUrl": "/Settings/Logo/3ecd1bab-a4e2-473e-97d4-aeff18ec46c5_6222035228264-92-102g.webp"
    }
}