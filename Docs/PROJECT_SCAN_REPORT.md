# تقرير فحص مشروع Spider2026

> **تاريخ الفحص:** 8 يوليو 2026  
> **إجمالي الملفات:** 1,078 ملف (بدون `node_modules` / `.angular` / `dist` / `.git`)  
> **نوع المشروع:** نظام ERP (Enterprise Resource Planning) — واجهة أمامية Angular

---

## جدول المحتويات

1. [نظرة عامة](#1-نظرة-عامة)
2. [التقنيات المستخدمة](#2-التقنيات-المستخدمة)
3. [هيكل المشروع العام](#3-هيكل-المشروع-العام)
4. [البنية المعمارية](#4-البنية-المعمارية)
5. [المسارات والتوجيه (Routing)](#5-المسارات-والتوجيه-routing)
6. [وحدات النظام (Modules)](#6-وحدات-النظام-modules)
7. [الطبقة المشتركة (Shared)](#7-الطبقة-المشتركة-shared)
8. [الطبقة الأساسية (Core)](#8-الطبقة-الأساسية-core)
9. [إحصائيات الملفات](#9-إحصائيات-الملفات)
10. [فهرس الملفات الكامل](#10-فهرس-الملفات-الكامل)

---

## 1. نظرة عامة

**Spider2026** هو تطبيق ERP متكامل مبني بـ **Angular 21** يغطي دورة الأعمال الكاملة:

| المجال | الوحدات |
|--------|---------|
| **المشتريات** | طلبات شراء، فواتير شراء، فواتير دولية، مرتجعات |
| **المبيعات** | فواتير مبيعات، عروض أسعار، تسليم بضائع، نقاط بيع |
| **المخزون** | أرصدة افتتاحية، توريد، تسويات، جرد، إتلاف |
| **التحويلات** | تحويلات مخزنية، تحويلات نقدية بين الفروع |
| **المحاسبة** | حسابات، قيود يومية، شيكات واردة |
| **المالية** | مقبوضات، مصروفات، أقساط |
| **الموارد البشرية** | موظفين، عهد، بدلات، رواتب |
| **المنتجات** | بطاقات أصناف، فئات، مجموعات، وحدات قياس |
| **العملاء والموردين** | عملاء، موردين، مندوبين |
| **الفواتير الإلكترونية** | فواتير إلكترونية، إشعارات دائن/مدين |
| **الإعدادات** | إعدادات الشركة والفروع، المستخدمين والصلاحيات |

**API Backend:** `https://spider-web.api.gts-sa.net`

---

## 2. التقنيات المستخدمة

| التقنية | الإصدار / الاستخدام |
|---------|---------------------|
| Angular | ^21.2.0 — Standalone Components |
| TypeScript | ~5.9.2 |
| PrimeNG | ^21.1.4 — مكوّنات UI |
| TailwindCSS | ^4.2.2 — تنسيق |
| RxJS | ~7.8.0 — برمجة تفاعلية |
| Vitest | ^4.0.8 — اختبارات وحدة |
| Font Awesome | ^7.2.0 — أيقونات |
| ng-select | ^21.7.0 — قوائم منسدلة |
| intl-tel-input | ^28.0.4 — أرقام هواتف دولية |
| pdfmake / jsPDF | توليد وطباعة PDF |
| jwt-decode | ^4.0.0 — فك تشفير JWT |
| SCSS | أنماط المكوّنات |

---

## 3. هيكل المشروع العام

```
spider2026/
├── .cursor/rules/          # قواعد Cursor للمشروع
├── .vscode/                # إعدادات VS Code (launch, tasks, MCP)
├── public/                 # أصول ثابتة (خطوط، صور، favicon)
├── src/
│   ├── app/
│   │   ├── core/           # Guards, Interceptors
│   │   ├── features/       # auth, dashboard
│   │   ├── layouts/        # auth-layout, main-layout
│   │   └── shared/         # مكوّنات وخدمات مشتركة
│   ├── assets/             # أصول التطبيق
│   ├── environments/       # إعدادات البيئة
│   ├── main.ts             # نقطة الدخول
│   ├── styles.scss         # أنماط عامة
│   └── for-tailwind.css    # Tailwind
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. البنية المعمارية

### 4.1 نمط التنظيم

المشروع يتبع **Feature-Based Architecture**:

- **`core/`** — خدمات وآليات على مستوى التطبيق (Guards, Interceptors)
- **`shared/`** — مكوّنات UI، خدمات، validations، enums قابلة لإعادة الاستخدام
- **`features/`** — كل وحدة أعمال مستقلة (auth, dashboard/pages/*)
- **`layouts/`** — تخطيطات الصفحات (Auth, Main)

### 4.2 نمط المكوّنات

كل feature يتبع نمطاً موحداً:

```
feature-name/
├── feature-name.ts          # المكوّن الرئيسي (Shell)
├── feature-name.html
├── feature-name.scss
├── feature-name.route.ts    # المسارات
├── add-feature/             # صفحة الإضافة
├── explorer-feature/        # صفحة الاستعراض/البحث
├── models/                  # واجهات TypeScript
└── services/                # خدمات API
```

### 4.3 طبقة HTTP

جميع خدمات API ترث من **`BaseHttpService`** الذي يوفر:

- `create()` — POST إنشاء
- `getAllSendInBody()` / `getAllSendInQuery()` — جلب الكل مع pagination
- `getById()` / `getByIdInQuery()` — جلب بالمعرّف
- `update()` / `updateWithOutPathParameter()` — تحديث
- `delete()` — حذف
- `search()` — بحث (مع `skip-loading` header)

### 4.4 المصادقة

- تسجيل الدخول عبر `/api/Auth/Login`
- تخزين JWT في `localStorage` أو `sessionStorage` تحت مفتاح `erp_auth`
- **`authGuard`** — يحمي مسارات Dashboard
- **`guestGuard`** — يحمي صفحة Auth من المستخدمين المسجّلين
- **`httpInterceptor`** — يضيف `Authorization: Bearer` ويدير Loading

---

## 5. المسارات والتوجيه (Routing)

```
/                          → redirect → /dashboard
/auth                      → AuthLayout → Auth (Login)
/dashboard                 → MainLayout → Dashboard
  /home                    → الصفحة الرئيسية
  /purchase-order          → طلب شراء
  /purchase-invoice        → فاتورة شراء
  /sales-invoice           → فاتورة مبيعات
  /products/*              → المنتجات
  /hr/*                    → الموارد البشرية
  /accounts-parent/*       → الحسابات
  ... (50+ وحدة)
```

**Lazy Loading:** جميع المكوّنات تُحمَّل بـ `loadComponent()` — لا NgModules.

---

## 6. وحدات النظام (Modules)

### 6.1 accounts-parent — الحسابات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `accounts` | دليل الحسابات + طباعة |
| `daily-entry` | القيود اليومية |
| `dependence-daily-entry` | قيود يومية تابعة |
| `finance-year` | السنة المالية |
| `incomming-checks` | الشيكات الواردة |

### 6.2 purchases — المشتريات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `purchase-order` | طلب شراء |
| `autometed-purchase-order` | طلب شراء آلي |
| `purchase-invoice` | فاتورة شراء |
| `international-purchase-invoice` | فاتورة شراء دولية |

### 6.3 purchase-returns — مرتجعات المشتريات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `purchase-returns` | مرتجعات المشتريات |
| `purchase-returns-without-invoice-number` | مرتجعات بدون رقم فاتورة |
| `multiply-purchase-returns` | مرتجعات متعددة |
| `purchase-invoice-draft` | مسودة فواتير المشتريات |

### 6.4 sales — المبيعات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `display-sales-prices` | عرض أسعار المبيعات |
| `sales-invoice` | فاتورة مبيعات |
| `delivery-goods` | تسليم بضائع |
| `disbursing-reservations` | صرف حجوزات |
| `depit-notification` | إشعار مدين |
| `quick-sales-point-cashiers` | نقاط بيع سريعة |

### 6.5 sales-returns — مرتجعات المبيعات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `sales-returns` | مرتجعات المبيعات |
| `multiply-sales-returns` | مرتجعات متعددة |
| `draft-sales-invoice` | مسودة فواتير مبيعات |
| `payment-voucher` | سند صرف |

### 6.6 inventory — المخزون
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `opening-balance` | رصيد افتتاحي |
| `supply-order` | أمر توريد |
| `inventory-adjustment-request` | طلب تسوية مخزنية |
| `inventory-adjustment` | تسوية مخزنية |
| `conjugation-command` | أمر ضم |
| `scrap` | إتلاف |
| `periodic-inventory-warehouse` | جرد دوري |
| `damaged-disbursement-request` | طلب صرف تالف |

### 6.7 Transfers — التحويلات المخزنية
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `inventory-transfer-order` | أمر تحويل مخزني |
| `incomming-transfer` | تحويل وارد |
| `inventory-transfer-receive` | استلام تحويل |
| `internal-exchange-permit` | إذن صرف داخلي |
| `transfer-between-repositry` | تحويل بين مستودعات |

### 6.8 cash-transfers — التحويلات النقدية
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `outgoing-transfer` | تحويل صادر |
| `outgoing-transfer-approve` | اعتماد تحويل صادر |
| `incomming-cash-transfer` | تحويل نقدي وارد |
| `depreciations` | إهلاكات |
| `cash-transfer-between-two-branches` | تحويل بين فرعين |

### 6.9 Receivables — المقبوضات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `receipt-voucher` | سند قبض |
| `multiply-receipt-voucher` | سند قبض متعدد |

### 6.10 expenses — المصروفات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `simple-payment-voucher` | سند صرف بسيط |
| `mutliply-payment-voucher` | سند صرف متعدد |

### 6.11 products — المنتجات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `units-of-measurement` | وحدات القياس |
| `categories` | الفئات |
| `groups` | المجموعات |
| `product-card` | بطاقة الصنف (add/explorer) |
| `inventories` | المستودعات |

### 6.12 customers-and-supplier — العملاء والموردين
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `customers` | العملاء |
| `suppliers` | الموردين |
| `thedelegate` | المندوبين |

### 6.13 hr — الموارد البشرية
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `sections` | الأقسام |
| `employees` | الموظفين |
| `proof-of-salary` | إثبات راتب |
| `exchange-of-salaries` | صرف رواتب |
| `addition` | إضافات |
| `receipt-custody` | استلام عهدة |
| `custody` | العهد |
| `allowances` | البدلات |

### 6.14 electronic-invoice — الفواتير الإلكترونية
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `sales-invoice` | فاتورة مبيعات إلكترونية |
| `credit-notification` | إشعار دائن |
| `depit-notification` | إشعار مدين |
| `invoice-ecommerce` | فاتورة تجارة إلكترونية |

### 6.15 installment — الأقساط
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `installment-proof` | إثبات أقساط |
| `installment-payment` | سداد أقساط |

### 6.16 costcenter-and-projects — مراكز التكلفة والمشاريع
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `cost-center` | مراكز التكلفة |
| `projects` | المشاريع |

### 6.17 users-and-permissions — المستخدمين والصلاحيات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `users` | المستخدمين |
| `permissions` | الصلاحيات |
| `users-and-permissions` | ربط المستخدمين بالصلاحيات |

### 6.18 settings — الإعدادات
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `company-settings` | إعدادات الشركة |
| `branch-settings` | إعدادات الفروع |

### 6.19 qr-code — QR Code
| الوحدة الفرعية | الوصف |
|----------------|-------|
| `qrcode-printer` | طباعة QR Code |

### 6.20 home — الصفحة الرئيسية
لوحة تحكم Dashboard الرئيسية.

---

## 7. الطبقة المشتركة (Shared)

### 7.1 مكوّنات UI (`shared/ui/`)

| المكوّن | الوظيفة |
|---------|---------|
| `page-header` | رأس الصفحة |
| `page-header-search` | رأس صفحة مع بحث |
| `form-error` | عرض أخطاء النماذج |
| `loading` | مؤشر تحميل |
| `toastr` | إشعارات Toast |
| `shared-confirm-dialog` | حوار تأكيد |
| `attachment-manager` | إدارة المرفقات |
| `input-attachment` | إدخال مرفق |
| `generate-pdf` | توليد PDF |
| `tree-node` | عقدة شجرة |
| `tree-permissions` | شجرة صلاحيات |
| `tree-project` | شجرة مشاريع |

### 7.2 مكوّنات Layout (`shared/components/`)

| المكوّن | الوظيفة |
|---------|---------|
| `header` | شريط علوي |
| `sidebar` | القائمة الجانبية (Navigation) |
| `pdf-printer` | طباعة PDF |

### 7.3 خدمات (`shared/services/`)

| الخدمة | الوظيفة |
|--------|---------|
| `basehttp-service` | خدمة HTTP أساسية لجميع API |
| `shared-state-services` | إدارة حالة مشتركة |
| `active-filter-key` | مفاتيح فلاتر نشطة |
| `calculations/totals` | حسابات الإجماليات |

### 7.4 Base Classes (`shared/base/`)

| الكلاس | الوظيفة |
|--------|---------|
| `form-component-base` | قاعدة لمكوّنات النماذج |
| `destroy-base-component` | إدارة unsubscribe |
| `LookupFacade` | واجهة للقوائم المرجعية |

### 7.5 Directives (`shared/directives/`)

| Directive | الوظيفة |
|-----------|---------|
| `only-number` | أرقام فقط |
| `only-string` | نصوص فقط |
| `percentage-max` | حد أقصى للنسبة |

### 7.6 Validations (`shared/validations/`)

`email`, `phoneNumber`, `user-name`, `address`, `entity-name-validator`, `noLeadingSpace`, `usernameOrEmailValidators`, `validation-helper`, `validation-messages`

### 7.7 Enums (`shared/Enums/`)

`customer-type`, `custSupp-type`, `delegate-commetion-type`, `enumSearch`, `invoice`, `product-type`

---

## 8. الطبقة الأساسية (Core)

| الملف | الوظيفة |
|-------|---------|
| `guards/auth-guard.ts` | يمنع الوصول بدون تسجيل دخول |
| `guards/guest-guard.ts` | يمنع المسجّلين من صفحة Auth |
| `interceptors/http.interceptor.ts` | JWT + Loading |
| `interceptors/error.interceptor.ts` | معالجة أخطاء HTTP |

---

## 9. إحصائيات الملفات

| النوع | العدد |
|-------|------:|
| `.ts` (TypeScript) | 604 |
| `.scss` (أنماط) | 221 |
| `.html` (قوالب) | 220 |
| `.json` | 11 |
| `.png` | 5 |
| `.md` | 3 |
| `.jpg` | 2 |
| `.svg` | 2 |
| `.ttf` (خطوط) | 2 |
| أخرى | 8 |
| **الإجمالي** | **1,078** |

### توزيع حسب المجلد الرئيسي

| المجلد | عدد الملفات |
|--------|------------:|
| `src/` | 1,048 |
| `public/` | 14 |
| `.vscode/` | 4 |
| جذر المشروع | 11 |
| `.cursor/` | 1 |

---

## 10. فهرس الملفات الكامل

> فيما يلي قائمة **كل ملف** في المشروع مرتبة حسب المجلد.

---

## 📁 (root)

### `(root)` (11 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `.editorconfig` | 331 B | ملف TypeScript |
| `.postcssrc.json` | 57 B | ملف TypeScript |
| `.prettierrc` | 173 B | ملف TypeScript |
| `angular.json` | 2.7 KB | ملف TypeScript |
| `package.json` | 1.4 KB | ملف TypeScript |
| `package-lock.json` | 330.7 KB | ملف TypeScript |
| `PROJECT_CONTEXT.md` | 299 B | ملف TypeScript |
| `README.md` | 1.5 KB | ملف TypeScript |
| `tsconfig.app.json` | 444 B | ملف TypeScript |
| `tsconfig.json` | 990 B | ملف TypeScript |
| `tsconfig.spec.json` | 456 B | ملف TypeScript |

## 📁 .cursor\rules

### `.cursor\rules` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `angular.mdc` | 377 B | ملف TypeScript |

## 📁 .vscode

### `.vscode` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `extensions.json` | 134 B | ملف TypeScript |
| `launch.json` | 490 B | ملف TypeScript |
| `mcp.json` | 188 B | ملف TypeScript |
| `tasks.json` | 1020 B | ملف TypeScript |

## 📁 public

### `public` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `favicon.ico` | 14.7 KB | ملف TypeScript |

## 📁 public\fonts

### `public\fonts` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `Cairo-Bold.ttf` | 92.4 KB | ملف TypeScript |
| `Cairo-Regular.ttf` | 92.3 KB | ملف TypeScript |

## 📁 public\images

### `public\images` (10 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `arrow-left.png` | 194 B | ملف TypeScript |
| `check.png` | 12.3 KB | ملف TypeScript |
| `close.png` | 15.9 KB | ملف TypeScript |
| `iconSpider.jpg` | 30.6 KB | ملف TypeScript |
| `logo.png` | 8.1 KB | ملف TypeScript |
| `logos.svg` | 490 B | ملف TypeScript |
| `pizza.jpg` | 108.7 KB | ملف TypeScript |
| `spiderlogo.svg` | 1.2 KB | ملف TypeScript |
| `uploadImage.png` | 8.6 KB | ملف TypeScript |
| `user.avif` | 5.1 KB | ملف TypeScript |

## 📁 public\styles

### `public\styles` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `_responsive.scss` | 203 B | أنماط المكوّن |

## 📁 src

### `src` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `for-tailwind.css` | 157 B | ملف TypeScript |
| `index.html` | 326 B | قالب المكوّن |
| `main.ts` | 228 B | ملف TypeScript |
| `styles.scss` | 29.8 KB | أنماط المكوّن |

## 📁 src\app

### `src\app` (6 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `app.config.ts` | 893 B | ملف TypeScript |
| `app.html` | 106 B | قالب المكوّن |
| `app.routes.ts` | 890 B | تعريف مسارات Angular |
| `app.scss` | 0 B | أنماط المكوّن |
| `app.spec.ts` | 700 B | اختبار وحدة (Vitest) |
| `app.ts` | 923 B | ملف TypeScript |

## 📁 src\app\core\guards

### `src\app\core\guards` (3 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `auth-guard.spec.ts` | 458 B | اختبار وحدة (Vitest) |
| `auth-guard.ts` | 382 B | حارس مسارات |
| `guest-guard.ts` | 452 B | حارس مسارات |

## 📁 src\app\core\interceptors

### `src\app\core\interceptors` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `error.interceptor.spec.ts` | 497 B | اختبار وحدة (Vitest) |
| `error.interceptor.ts` | 4.7 KB | معترض HTTP |
| `http.interceptor.spec.ts` | 493 B | اختبار وحدة (Vitest) |
| `http.interceptor.ts` | 1.6 KB | معترض HTTP |

## 📁 src\app\features\auth

### `src\app\features\auth` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `auth.html` | 17.9 KB | قالب المكوّن |
| `auth.route.ts` | 0 B | تعريف مسارات Angular |
| `auth.scss` | 1.8 KB | أنماط المكوّن |
| `auth.spec.ts` | 513 B | اختبار وحدة (Vitest) |
| `auth.ts` | 2.7 KB | ملف TypeScript |

## 📁 src\app\features\auth\models

### `src\app\features\auth\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `auth.ts` | 125 B | ملف TypeScript |

## 📁 src\app\features\auth\services

### `src\app\features\auth\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `auth-services.spec.ts` | 352 B | اختبار وحدة (Vitest) |
| `auth-services.ts` | 1.6 KB | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard

### `src\app\features\dashboard` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `dashboard.html` | 69 B | قالب المكوّن |
| `dashboard.route.ts` | 8.4 KB | تعريف مسارات Angular |
| `dashboard.scss` | 0 B | أنماط المكوّن |
| `dashboard.spec.ts` | 548 B | اختبار وحدة (Vitest) |
| `dashboard.ts` | 281 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent

### `src\app\features\dashboard\pages\accounts-parent` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `accounts-parent.html` | 31 B | قالب المكوّن |
| `accounts-parent.route.ts` | 829 B | تعريف مسارات Angular |
| `accounts-parent.scss` | 0 B | أنماط المكوّن |
| `accounts-parent.spec.ts` | 584 B | اختبار وحدة (Vitest) |
| `accounts-parent.ts` | 280 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\accounts

### `src\app\features\dashboard\pages\accounts-parent\accounts` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `accounts.html` | 18.6 KB | قالب المكوّن |
| `accounts.scss` | 105 B | أنماط المكوّن |
| `accounts.spec.ts` | 541 B | اختبار وحدة (Vitest) |
| `accounts.ts` | 12.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\accounts\components\print-page-accounts

### `src\app\features\dashboard\pages\accounts-parent\accounts\components\print-page-accounts` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `print-page-accounts.html` | 117 B | قالب المكوّن |
| `print-page-accounts.scss` | 0 B | أنماط المكوّن |
| `print-page-accounts.spec.ts` | 606 B | اختبار وحدة (Vitest) |
| `print-page-accounts.ts` | 273 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\accounts\models

### `src\app\features\dashboard\pages\accounts-parent\accounts\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `accounts.ts` | 570 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\accounts\services

### `src\app\features\dashboard\pages\accounts-parent\accounts\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `accounts-service.spec.ts` | 367 B | اختبار وحدة (Vitest) |
| `accounts-service.ts` | 884 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\accounts-parent\daily-entry

### `src\app\features\dashboard\pages\accounts-parent\daily-entry` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `daily-entry.html` | 32 B | قالب المكوّن |
| `daily-entry.route.ts` | 543 B | تعريف مسارات Angular |
| `daily-entry.scss` | 0 B | أنماط المكوّن |
| `daily-entry.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `daily-entry.ts` | 264 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\daily-entry\add-daily-entry

### `src\app\features\dashboard\pages\accounts-parent\daily-entry\add-daily-entry` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-daily-entry.html` | 16.9 KB | قالب المكوّن |
| `add-daily-entry.scss` | 0 B | أنماط المكوّن |
| `add-daily-entry.spec.ts` | 578 B | اختبار وحدة (Vitest) |
| `add-daily-entry.ts` | 2.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\daily-entry\explorer-daily-entry

### `src\app\features\dashboard\pages\accounts-parent\daily-entry\explorer-daily-entry` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-daily-entry.html` | 2.7 KB | قالب المكوّن |
| `explorer-daily-entry.scss` | 0 B | أنماط المكوّن |
| `explorer-daily-entry.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `explorer-daily-entry.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\dependence-daily-entry

### `src\app\features\dashboard\pages\accounts-parent\dependence-daily-entry` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `dependence-daily-entry.html` | 31 B | قالب المكوّن |
| `dependence-daily-entry.route.ts` | 649 B | تعريف مسارات Angular |
| `dependence-daily-entry.scss` | 0 B | أنماط المكوّن |
| `dependence-daily-entry.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `dependence-daily-entry.ts` | 307 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\dependence-daily-entry\add-dependence-daily-entry

### `src\app\features\dashboard\pages\accounts-parent\dependence-daily-entry\add-dependence-daily-entry` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-dependence-daily-entry.html` | 19.0 KB | قالب المكوّن |
| `add-dependence-daily-entry.scss` | 0 B | أنماط المكوّن |
| `add-dependence-daily-entry.spec.ts` | 649 B | اختبار وحدة (Vitest) |
| `add-dependence-daily-entry.ts` | 2.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\dependence-daily-entry\explorer-dependence-daily-entry

### `src\app\features\dashboard\pages\accounts-parent\dependence-daily-entry\explorer-dependence-daily-entry` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-dependence-daily-entry.html` | 2.7 KB | قالب المكوّن |
| `explorer-dependence-daily-entry.scss` | 0 B | أنماط المكوّن |
| `explorer-dependence-daily-entry.spec.ts` | 684 B | اختبار وحدة (Vitest) |
| `explorer-dependence-daily-entry.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\finance-year

### `src\app\features\dashboard\pages\accounts-parent\finance-year` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `finance-year.html` | 2.0 KB | قالب المكوّن |
| `finance-year.scss` | 0 B | أنماط المكوّن |
| `finance-year.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `finance-year.ts` | 344 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\incomming-checks

### `src\app\features\dashboard\pages\accounts-parent\incomming-checks` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `incomming-checks.html` | 31 B | قالب المكوّن |
| `incomming-checks.route.ts` | 706 B | تعريف مسارات Angular |
| `incomming-checks.scss` | 0 B | أنماط المكوّن |
| `incomming-checks.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `incomming-checks.ts` | 284 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\incomming-checks\add-incomming-checks

### `src\app\features\dashboard\pages\accounts-parent\incomming-checks\add-incomming-checks` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-incomming-checks.html` | 16.8 KB | قالب المكوّن |
| `add-incomming-checks.scss` | 0 B | أنماط المكوّن |
| `add-incomming-checks.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `add-incomming-checks.ts` | 2.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\accounts-parent\incomming-checks\explorer-incomming-checks

### `src\app\features\dashboard\pages\accounts-parent\incomming-checks\explorer-incomming-checks` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-incomming-checks.html` | 3.0 KB | قالب المكوّن |
| `explorer-incomming-checks.scss` | 0 B | أنماط المكوّن |
| `explorer-incomming-checks.spec.ts` | 648 B | اختبار وحدة (Vitest) |
| `explorer-incomming-checks.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\cash-transfer-between-two-branches

### `src\app\features\dashboard\pages\cash-transfers\cash-transfer-between-two-branches` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `cash-transfer-between-two-branches.html` | 32 B | قالب المكوّن |
| `cash-transfer-between-two-branches.route.ts` | 822 B | تعريف مسارات Angular |
| `cash-transfer-between-two-branches.scss` | 0 B | أنماط المكوّن |
| `cash-transfer-between-two-branches.spec.ts` | 699 B | اختبار وحدة (Vitest) |
| `cash-transfer-between-two-branches.ts` | 353 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\cash-transfer-between-two-branches\add-cash-transfer-between-two-branches

### `src\app\features\dashboard\pages\cash-transfers\cash-transfer-between-two-branches\add-cash-transfer-between-two-branches` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-cash-transfer-between-two-branches.html` | 7.7 KB | قالب المكوّن |
| `add-cash-transfer-between-two-branches.scss` | 0 B | أنماط المكوّن |
| `add-cash-transfer-between-two-branches.spec.ts` | 721 B | اختبار وحدة (Vitest) |
| `add-cash-transfer-between-two-branches.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\cash-transfer-between-two-branches\explorer-cash-transfer-between-two-branches

### `src\app\features\dashboard\pages\cash-transfers\cash-transfer-between-two-branches\explorer-cash-transfer-between-two-branches` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-cash-transfer-between-two-branches.html` | 6.5 KB | قالب المكوّن |
| `explorer-cash-transfer-between-two-branches.scss` | 0 B | أنماط المكوّن |
| `explorer-cash-transfer-between-two-branches.spec.ts` | 756 B | اختبار وحدة (Vitest) |
| `explorer-cash-transfer-between-two-branches.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\depreciations

### `src\app\features\dashboard\pages\cash-transfers\depreciations` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `depreciations.html` | 31 B | قالب المكوّن |
| `depreciations.route.ts` | 666 B | تعريف مسارات Angular |
| `depreciations.scss` | 0 B | أنماط المكوّن |
| `depreciations.spec.ts` | 576 B | اختبار وحدة (Vitest) |
| `depreciations.ts` | 273 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\depreciations\add-depreciations

### `src\app\features\dashboard\pages\cash-transfers\depreciations\add-depreciations` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-depreciations.html` | 7.7 KB | قالب المكوّن |
| `add-depreciations.scss` | 0 B | أنماط المكوّن |
| `add-depreciations.spec.ts` | 598 B | اختبار وحدة (Vitest) |
| `add-depreciations.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\depreciations\explorer-depreciations

### `src\app\features\dashboard\pages\cash-transfers\depreciations\explorer-depreciations` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-depreciations.html` | 6.5 KB | قالب المكوّن |
| `explorer-depreciations.scss` | 0 B | أنماط المكوّن |
| `explorer-depreciations.spec.ts` | 633 B | اختبار وحدة (Vitest) |
| `explorer-depreciations.ts` | 1.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\incomming-cash-transfer

### `src\app\features\dashboard\pages\cash-transfers\incomming-cash-transfer` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `incomming-cash-transfer.html` | 31 B | قالب المكوّن |
| `incomming-cash-transfer.route.ts` | 756 B | تعريف مسارات Angular |
| `incomming-cash-transfer.scss` | 0 B | أنماط المكوّن |
| `incomming-cash-transfer.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `incomming-cash-transfer.ts` | 311 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\incomming-cash-transfer\add-incomming-cash-transfer

### `src\app\features\dashboard\pages\cash-transfers\incomming-cash-transfer\add-incomming-cash-transfer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-incomming-cash-transfer.html` | 17.6 KB | قالب المكوّن |
| `add-incomming-cash-transfer.scss` | 0 B | أنماط المكوّن |
| `add-incomming-cash-transfer.spec.ts` | 656 B | اختبار وحدة (Vitest) |
| `add-incomming-cash-transfer.ts` | 2.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\incomming-cash-transfer\explorer-incomming-cash-transfer

### `src\app\features\dashboard\pages\cash-transfers\incomming-cash-transfer\explorer-incomming-cash-transfer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-incomming-cash-transfer.html` | 2.6 KB | قالب المكوّن |
| `explorer-incomming-cash-transfer.scss` | 0 B | أنماط المكوّن |
| `explorer-incomming-cash-transfer.spec.ts` | 691 B | اختبار وحدة (Vitest) |
| `explorer-incomming-cash-transfer.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\outgoing-transfer

### `src\app\features\dashboard\pages\cash-transfers\outgoing-transfer` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `outgoing-transfer.html` | 31 B | قالب المكوّن |
| `outgoing-transfer.route.ts` | 602 B | تعريف مسارات Angular |
| `outgoing-transfer.scss` | 0 B | أنماط المكوّن |
| `outgoing-transfer.spec.ts` | 598 B | اختبار وحدة (Vitest) |
| `outgoing-transfer.ts` | 378 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\outgoing-transfer\add-outgoing-transfer

### `src\app\features\dashboard\pages\cash-transfers\outgoing-transfer\add-outgoing-transfer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-outgoing-transfer.html` | 16.0 KB | قالب المكوّن |
| `add-outgoing-transfer.scss` | 81 B | أنماط المكوّن |
| `add-outgoing-transfer.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `add-outgoing-transfer.ts` | 2.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\outgoing-transfer\explorer-outgoing-transfer

### `src\app\features\dashboard\pages\cash-transfers\outgoing-transfer\explorer-outgoing-transfer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-outgoing-transfer.html` | 2.7 KB | قالب المكوّن |
| `explorer-outgoing-transfer.scss` | 67 B | أنماط المكوّن |
| `explorer-outgoing-transfer.spec.ts` | 655 B | اختبار وحدة (Vitest) |
| `explorer-outgoing-transfer.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\outgoing-transfer-approve

### `src\app\features\dashboard\pages\cash-transfers\outgoing-transfer-approve` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `outgoing-tranfer-approve.route.ts` | 778 B | تعريف مسارات Angular |
| `outgoing-transfer-approve.html` | 31 B | قالب المكوّن |
| `outgoing-transfer-approve.scss` | 0 B | أنماط المكوّن |
| `outgoing-transfer-approve.spec.ts` | 648 B | اختبار وحدة (Vitest) |
| `outgoing-transfer-approve.ts` | 319 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\outgoing-transfer-approve\add-outgoing-transfer-approve

### `src\app\features\dashboard\pages\cash-transfers\outgoing-transfer-approve\add-outgoing-transfer-approve` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-outgoing-transfer-approve.html` | 17.6 KB | قالب المكوّن |
| `add-outgoing-transfer-approve.scss` | 0 B | أنماط المكوّن |
| `add-outgoing-transfer-approve.spec.ts` | 670 B | اختبار وحدة (Vitest) |
| `add-outgoing-transfer-approve.ts` | 2.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\cash-transfers\outgoing-transfer-approve\explorer-outgoing-transfer-approve

### `src\app\features\dashboard\pages\cash-transfers\outgoing-transfer-approve\explorer-outgoing-transfer-approve` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-outgoing-transfer-approve.html` | 2.8 KB | قالب المكوّن |
| `explorer-outgoing-transfer-approve.scss` | 0 B | أنماط المكوّن |
| `explorer-outgoing-transfer-approve.spec.ts` | 705 B | اختبار وحدة (Vitest) |
| `explorer-outgoing-transfer-approve.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects

### `src\app\features\dashboard\pages\costcenter-and-projects` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `costcenter-and-projects.html` | 31 B | قالب المكوّن |
| `costcenter-and-projects.route.ts` | 480 B | تعريف مسارات Angular |
| `costcenter-and-projects.scss` | 0 B | أنماط المكوّن |
| `costcenter-and-projects.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `costcenter-and-projects.ts` | 311 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\cost-center

### `src\app\features\dashboard\pages\costcenter-and-projects\cost-center` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `cost-center.html` | 24.9 KB | قالب المكوّن |
| `cost-center.scss` | 112 B | أنماط المكوّن |
| `cost-center.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `cost-center.ts` | 12.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\cost-center\models

### `src\app\features\dashboard\pages\costcenter-and-projects\cost-center\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `cost-center.ts` | 152 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\cost-center\services

### `src\app\features\dashboard\pages\costcenter-and-projects\cost-center\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `cost-center.spec.ts` | 342 B | اختبار وحدة (Vitest) |
| `cost-center.ts` | 516 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\projects

### `src\app\features\dashboard\pages\costcenter-and-projects\projects` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `projects.html` | 31 B | قالب المكوّن |
| `projects.route.ts` | 617 B | تعريف مسارات Angular |
| `projects.scss` | 0 B | أنماط المكوّن |
| `projects.spec.ts` | 541 B | اختبار وحدة (Vitest) |
| `projects.ts` | 253 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\projects\add-projects

### `src\app\features\dashboard\pages\costcenter-and-projects\projects\add-projects` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-projects.html` | 24.8 KB | قالب المكوّن |
| `add-projects.scss` | 0 B | أنماط المكوّن |
| `add-projects.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `add-projects.ts` | 14.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\projects\explorer-projects

### `src\app\features\dashboard\pages\costcenter-and-projects\projects\explorer-projects` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-projects.html` | 3.6 KB | قالب المكوّن |
| `explorer-projects.scss` | 0 B | أنماط المكوّن |
| `explorer-projects.spec.ts` | 598 B | اختبار وحدة (Vitest) |
| `explorer-projects.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\projects\models

### `src\app\features\dashboard\pages\costcenter-and-projects\projects\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `projects.ts` | 757 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\costcenter-and-projects\projects\services

### `src\app\features\dashboard\pages\costcenter-and-projects\projects\services` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `projects.service.ts` | 516 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\customers

### `src\app\features\dashboard\pages\customers-and-supplier\customers` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `customers.html` | 31 B | قالب المكوّن |
| `customers.route.ts` | 628 B | تعريف مسارات Angular |
| `customers.scss` | 0 B | أنماط المكوّن |
| `customers.spec.ts` | 548 B | اختبار وحدة (Vitest) |
| `customers.ts` | 257 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\customers\add-customers

### `src\app\features\dashboard\pages\customers-and-supplier\customers\add-customers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-customers.html` | 21.8 KB | قالب المكوّن |
| `add-customers.scss` | 288 B | أنماط المكوّن |
| `add-customers.spec.ts` | 570 B | اختبار وحدة (Vitest) |
| `add-customers.ts` | 15.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\customers\explorer-customers

### `src\app\features\dashboard\pages\customers-and-supplier\customers\explorer-customers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-customers.html` | 4.7 KB | قالب المكوّن |
| `explorer-customers.scss` | 0 B | أنماط المكوّن |
| `explorer-customers.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `explorer-customers.ts` | 4.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\customers\models

### `src\app\features\dashboard\pages\customers-and-supplier\customers\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `customers.ts` | 430 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\customers\services

### `src\app\features\dashboard\pages\customers-and-supplier\customers\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `customers.spec.ts` | 336 B | اختبار وحدة (Vitest) |
| `customers.ts` | 491 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\suppliers

### `src\app\features\dashboard\pages\customers-and-supplier\suppliers` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `suppliers.html` | 31 B | قالب المكوّن |
| `suppliers.routes.ts` | 627 B | تعريف مسارات Angular |
| `suppliers.scss` | 0 B | أنماط المكوّن |
| `suppliers.spec.ts` | 548 B | اختبار وحدة (Vitest) |
| `suppliers.ts` | 257 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\suppliers\add-suppliers

### `src\app\features\dashboard\pages\customers-and-supplier\suppliers\add-suppliers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-suppliers.html` | 21.9 KB | قالب المكوّن |
| `add-suppliers.scss` | 0 B | أنماط المكوّن |
| `add-suppliers.spec.ts` | 570 B | اختبار وحدة (Vitest) |
| `add-suppliers.ts` | 15.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\suppliers\explorer-suppliers

### `src\app\features\dashboard\pages\customers-and-supplier\suppliers\explorer-suppliers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-suppliers.html` | 4.7 KB | قالب المكوّن |
| `explorer-suppliers.scss` | 0 B | أنماط المكوّن |
| `explorer-suppliers.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `explorer-suppliers.ts` | 3.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\suppliers\models

### `src\app\features\dashboard\pages\customers-and-supplier\suppliers\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `supplier.ts` | 333 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\suppliers\services

### `src\app\features\dashboard\pages\customers-and-supplier\suppliers\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `suppliers.spec.ts` | 336 B | اختبار وحدة (Vitest) |
| `suppliers.ts` | 495 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\thedelegate

### `src\app\features\dashboard\pages\customers-and-supplier\thedelegate` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `thedelegate.html` | 31 B | قالب المكوّن |
| `thedelegate.route.ts` | 635 B | تعريف مسارات Angular |
| `thedelegate.scss` | 0 B | أنماط المكوّن |
| `thedelegate.spec.ts` | 562 B | اختبار وحدة (Vitest) |
| `thedelegate.ts` | 265 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\thedelegate\add-the-delegate

### `src\app\features\dashboard\pages\customers-and-supplier\thedelegate\add-the-delegate` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-the-delegate.html` | 13.9 KB | قالب المكوّن |
| `add-the-delegate.scss` | 0 B | أنماط المكوّن |
| `add-the-delegate.spec.ts` | 585 B | اختبار وحدة (Vitest) |
| `add-the-delegate.ts` | 8.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\thedelegate\explorer-the-delegate

### `src\app\features\dashboard\pages\customers-and-supplier\thedelegate\explorer-the-delegate` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-the-delegate.html` | 4.5 KB | قالب المكوّن |
| `explorer-the-delegate.scss` | 0 B | أنماط المكوّن |
| `explorer-the-delegate.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `explorer-the-delegate.ts` | 5.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\thedelegate\models

### `src\app\features\dashboard\pages\customers-and-supplier\thedelegate\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `delegate.ts` | 178 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\customers-and-supplier\thedelegate\services

### `src\app\features\dashboard\pages\customers-and-supplier\thedelegate\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `delegate-services.spec.ts` | 372 B | اختبار وحدة (Vitest) |
| `delegate-services.ts` | 511 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\electronic-invoice

### `src\app\features\dashboard\pages\electronic-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `electronic-invoice.html` | 31 B | قالب المكوّن |
| `electronic-invoice.routes.ts` | 755 B | تعريف مسارات Angular |
| `electronic-invoice.scss` | 0 B | أنماط المكوّن |
| `electronic-invoice.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `electronic-invoice.ts` | 292 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\credit-notification

### `src\app\features\dashboard\pages\electronic-invoice\credit-notification` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `credit-notification.html` | 31 B | قالب المكوّن |
| `credit-notification.routes.ts` | 755 B | تعريف مسارات Angular |
| `credit-notification.scss` | 0 B | أنماط المكوّن |
| `credit-notification.spec.ts` | 612 B | اختبار وحدة (Vitest) |
| `credit-notification.ts` | 296 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\credit-notification\add-credit-notification

### `src\app\features\dashboard\pages\electronic-invoice\credit-notification\add-credit-notification` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-credit-notification.html` | 17.7 KB | قالب المكوّن |
| `add-credit-notification.scss` | 0 B | أنماط المكوّن |
| `add-credit-notification.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `add-credit-notification.ts` | 5.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\credit-notification\explorer-credit-notification

### `src\app\features\dashboard\pages\electronic-invoice\credit-notification\explorer-credit-notification` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-credit-notification.html` | 6.9 KB | قالب المكوّن |
| `explorer-credit-notification.scss` | 0 B | أنماط المكوّن |
| `explorer-credit-notification.spec.ts` | 669 B | اختبار وحدة (Vitest) |
| `explorer-credit-notification.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\depit-notification

### `src\app\features\dashboard\pages\electronic-invoice\depit-notification` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `depit-notification.html` | 32 B | قالب المكوّن |
| `depit-notification.routes.ts` | 724 B | تعريف مسارات Angular |
| `depit-notification.scss` | 0 B | أنماط المكوّن |
| `depit-notification.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `depit-notification.ts` | 292 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\depit-notification\add-depit-notification

### `src\app\features\dashboard\pages\electronic-invoice\depit-notification\add-depit-notification` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-depit-notification.html` | 20.1 KB | قالب المكوّن |
| `add-depit-notification.scss` | 0 B | أنماط المكوّن |
| `add-depit-notification.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `add-depit-notification.ts` | 5.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\depit-notification\explorer-depit-notification

### `src\app\features\dashboard\pages\electronic-invoice\depit-notification\explorer-depit-notification` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-depit-notification.html` | 6.9 KB | قالب المكوّن |
| `explorer-depit-notification.scss` | 0 B | أنماط المكوّن |
| `explorer-depit-notification.spec.ts` | 662 B | اختبار وحدة (Vitest) |
| `explorer-depit-notification.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\invoice-ecommerce

### `src\app\features\dashboard\pages\electronic-invoice\invoice-ecommerce` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `invoice-ecommerce.html` | 4.9 KB | قالب المكوّن |
| `invoice-ecommerce.scss` | 0 B | أنماط المكوّن |
| `invoice-ecommerce.spec.ts` | 598 B | اختبار وحدة (Vitest) |
| `invoice-ecommerce.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\sales-invoice

### `src\app\features\dashboard\pages\electronic-invoice\sales-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sales-invoice.html` | 31 B | قالب المكوّن |
| `sales-invoice.routes.ts` | 748 B | تعريف مسارات Angular |
| `sales-invoice.scss` | 0 B | أنماط المكوّن |
| `sales-invoice.spec.ts` | 570 B | اختبار وحدة (Vitest) |
| `sales-invoice.ts` | 272 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\sales-invoice\add-sales-invoice

### `src\app\features\dashboard\pages\electronic-invoice\sales-invoice\add-sales-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-sales-invoice.html` | 33.8 KB | قالب المكوّن |
| `add-sales-invoice.scss` | 0 B | أنماط المكوّن |
| `add-sales-invoice.spec.ts` | 592 B | اختبار وحدة (Vitest) |
| `add-sales-invoice.ts` | 5.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\electronic-invoice\sales-invoice\explorer-sales-invoice

### `src\app\features\dashboard\pages\electronic-invoice\sales-invoice\explorer-sales-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-sales-invoice.html` | 6.8 KB | قالب المكوّن |
| `explorer-sales-invoice.scss` | 0 B | أنماط المكوّن |
| `explorer-sales-invoice.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `explorer-sales-invoice.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses

### `src\app\features\dashboard\pages\expenses` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `expenses.html` | 31 B | قالب المكوّن |
| `expenses.route.ts` | 612 B | تعريف مسارات Angular |
| `expenses.scss` | 0 B | أنماط المكوّن |
| `expenses.spec.ts` | 541 B | اختبار وحدة (Vitest) |
| `expenses.ts` | 253 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses\mutliply-payment-voucher

### `src\app\features\dashboard\pages\expenses\mutliply-payment-voucher` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `multiply-payment-voucher.route.ts` | 769 B | تعريف مسارات Angular |
| `mutliply-payment-voucher.html` | 31 B | قالب المكوّن |
| `mutliply-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `mutliply-payment-voucher.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `mutliply-payment-voucher.ts` | 315 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses\mutliply-payment-voucher\add-multiply-payment-voucher

### `src\app\features\dashboard\pages\expenses\mutliply-payment-voucher\add-multiply-payment-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-multiply-payment-voucher.html` | 23.5 KB | قالب المكوّن |
| `add-multiply-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `add-multiply-payment-voucher.spec.ts` | 663 B | اختبار وحدة (Vitest) |
| `add-multiply-payment-voucher.ts` | 2.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses\mutliply-payment-voucher\explorer-multiply-payment-voucher

### `src\app\features\dashboard\pages\expenses\mutliply-payment-voucher\explorer-multiply-payment-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-multiply-payment-voucher.html` | 2.9 KB | قالب المكوّن |
| `explorer-multiply-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `explorer-multiply-payment-voucher.spec.ts` | 698 B | اختبار وحدة (Vitest) |
| `explorer-multiply-payment-voucher.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses\simple-payment-voucher

### `src\app\features\dashboard\pages\expenses\simple-payment-voucher` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `simple-payment-voucher.html` | 32 B | قالب المكوّن |
| `simple-payment-voucher.route.ts` | 749 B | تعريف مسارات Angular |
| `simple-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `simple-payment-voucher.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `simple-payment-voucher.ts` | 307 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses\simple-payment-voucher\add-simple-payment-voucher

### `src\app\features\dashboard\pages\expenses\simple-payment-voucher\add-simple-payment-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-simple-payment-voucher.html` | 18.5 KB | قالب المكوّن |
| `add-simple-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `add-simple-payment-voucher.spec.ts` | 649 B | اختبار وحدة (Vitest) |
| `add-simple-payment-voucher.ts` | 2.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\expenses\simple-payment-voucher\explorer-simple-payment-voucher

### `src\app\features\dashboard\pages\expenses\simple-payment-voucher\explorer-simple-payment-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-simple-payment-voucher.html` | 2.9 KB | قالب المكوّن |
| `explorer-simple-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `explorer-simple-payment-voucher.spec.ts` | 684 B | اختبار وحدة (Vitest) |
| `explorer-simple-payment-voucher.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\home

### `src\app\features\dashboard\pages\home` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `home.html` | 19 B | قالب المكوّن |
| `home.scss` | 0 B | أنماط المكوّن |
| `home.spec.ts` | 513 B | اختبار وحدة (Vitest) |
| `home.ts` | 177 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr

### `src\app\features\dashboard\pages\hr` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `hr.html` | 31 B | قالب المكوّن |
| `hr.routes.ts` | 1.3 KB | تعريف مسارات Angular |
| `hr.scss` | 0 B | أنماط المكوّن |
| `hr.spec.ts` | 499 B | اختبار وحدة (Vitest) |
| `hr.ts` | 230 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\addition

### `src\app\features\dashboard\pages\hr\addition` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `addition.html` | 32 B | قالب المكوّن |
| `addition.route.ts` | 614 B | تعريف مسارات Angular |
| `addition.scss` | 0 B | أنماط المكوّن |
| `addition.spec.ts` | 541 B | اختبار وحدة (Vitest) |
| `addition.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\addition\add-addition

### `src\app\features\dashboard\pages\hr\addition\add-addition` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-addition.html` | 12.2 KB | قالب المكوّن |
| `add-addition.scss` | 0 B | أنماط المكوّن |
| `add-addition.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `add-addition.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\addition\explorer-addition

### `src\app\features\dashboard\pages\hr\addition\explorer-addition` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-addition.html` | 3.1 KB | قالب المكوّن |
| `explorer-addition.scss` | 0 B | أنماط المكوّن |
| `explorer-addition.spec.ts` | 598 B | اختبار وحدة (Vitest) |
| `explorer-addition.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\allowances

### `src\app\features\dashboard\pages\hr\allowances` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `allowances.html` | 6.4 KB | قالب المكوّن |
| `allowances.scss` | 0 B | أنماط المكوّن |
| `allowances.spec.ts` | 555 B | اختبار وحدة (Vitest) |
| `allowances.ts` | 6.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\allowances\services

### `src\app\features\dashboard\pages\hr\allowances\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `allowances.spec.ts` | 341 B | اختبار وحدة (Vitest) |
| `allowances.ts` | 510 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\custody

### `src\app\features\dashboard\pages\hr\custody` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `custody.html` | 4.6 KB | قالب المكوّن |
| `custody.scss` | 0 B | أنماط المكوّن |
| `custody.spec.ts` | 534 B | اختبار وحدة (Vitest) |
| `custody.ts` | 6.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\custody\models

### `src\app\features\dashboard\pages\hr\custody\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `custody.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\custody\services

### `src\app\features\dashboard\pages\hr\custody\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `custody-service.spec.ts` | 362 B | اختبار وحدة (Vitest) |
| `custody-service.ts` | 2.4 KB | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\hr\employees

### `src\app\features\dashboard\pages\hr\employees` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `employees.html` | 32 B | قالب المكوّن |
| `employees.routes.ts` | 528 B | تعريف مسارات Angular |
| `employees.scss` | 0 B | أنماط المكوّن |
| `employees.spec.ts` | 548 B | اختبار وحدة (Vitest) |
| `employees.ts` | 257 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\employees\add-employees

### `src\app\features\dashboard\pages\hr\employees\add-employees` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-employees.html` | 24.7 KB | قالب المكوّن |
| `add-employees.scss` | 0 B | أنماط المكوّن |
| `add-employees.spec.ts` | 570 B | اختبار وحدة (Vitest) |
| `add-employees.ts` | 17.2 KB | ملف TypeScript |
| `emp` | 13.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\employees\explorer-employees

### `src\app\features\dashboard\pages\hr\employees\explorer-employees` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-employees.html` | 3.4 KB | قالب المكوّن |
| `explorer-employees.scss` | 0 B | أنماط المكوّن |
| `explorer-employees.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `explorer-employees.ts` | 3.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\employees\model

### `src\app\features\dashboard\pages\hr\employees\model` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `employee.ts` | 1.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\employees\services

### `src\app\features\dashboard\pages\hr\employees\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `employee-service.spec.ts` | 367 B | اختبار وحدة (Vitest) |
| `employee-service.ts` | 461 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\hr\exchange-of-salaries

### `src\app\features\dashboard\pages\hr\exchange-of-salaries` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `exchange-of-salaries.html` | 8.9 KB | قالب المكوّن |
| `exchange-of-salaries.scss` | 47 B | أنماط المكوّن |
| `exchange-of-salaries.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `exchange-of-salaries.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\proof-of-salary

### `src\app\features\dashboard\pages\hr\proof-of-salary` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `proof-of-salary.html` | 5.6 KB | قالب المكوّن |
| `proof-of-salary.scss` | 0 B | أنماط المكوّن |
| `proof-of-salary.spec.ts` | 578 B | اختبار وحدة (Vitest) |
| `proof-of-salary.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\receipt-custody

### `src\app\features\dashboard\pages\hr\receipt-custody` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `receipt-custody.html` | 31 B | قالب المكوّن |
| `receipt-custody.routes.ts` | 683 B | تعريف مسارات Angular |
| `receipt-custody.scss` | 0 B | أنماط المكوّن |
| `receipt-custody.spec.ts` | 584 B | اختبار وحدة (Vitest) |
| `receipt-custody.ts` | 280 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\receipt-custody\add-receipt-custody

### `src\app\features\dashboard\pages\hr\receipt-custody\add-receipt-custody` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-receipt-custody.html` | 13.1 KB | قالب المكوّن |
| `add-receipt-custody.scss` | 0 B | أنماط المكوّن |
| `add-receipt-custody.spec.ts` | 606 B | اختبار وحدة (Vitest) |
| `add-receipt-custody.ts` | 10.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\receipt-custody\explorer-receipt-custody

### `src\app\features\dashboard\pages\hr\receipt-custody\explorer-receipt-custody` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-receipt-custody.html` | 5.0 KB | قالب المكوّن |
| `explorer-receipt-custody.scss` | 0 B | أنماط المكوّن |
| `explorer-receipt-custody.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `explorer-receipt-custody.ts` | 3.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\sections

### `src\app\features\dashboard\pages\hr\sections` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sections.html` | 5.8 KB | قالب المكوّن |
| `sections.scss` | 0 B | أنماط المكوّن |
| `sections.spec.ts` | 541 B | اختبار وحدة (Vitest) |
| `sections.ts` | 6.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\sections\models

### `src\app\features\dashboard\pages\hr\sections\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sections.ts` | 326 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\hr\sections\services

### `src\app\features\dashboard\pages\hr\sections\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sections-service.spec.ts` | 367 B | اختبار وحدة (Vitest) |
| `sections-service.ts` | 613 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\installment\installment-payment

### `src\app\features\dashboard\pages\installment\installment-payment` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `installment-payment.html` | 31 B | قالب المكوّن |
| `installment-payment.route.ts` | 826 B | تعريف مسارات Angular |
| `installment-payment.scss` | 0 B | أنماط المكوّن |
| `installment-payment.spec.ts` | 612 B | اختبار وحدة (Vitest) |
| `installment-payment.ts` | 296 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\installment\installment-payment\add-installment-payment

### `src\app\features\dashboard\pages\installment\installment-payment\add-installment-payment` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-installment-payment.html` | 15.7 KB | قالب المكوّن |
| `add-installment-payment.scss` | 0 B | أنماط المكوّن |
| `add-installment-payment.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `add-installment-payment.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\installment\installment-payment\explorer-installment-payment

### `src\app\features\dashboard\pages\installment\installment-payment\explorer-installment-payment` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-installment-payment.html` | 6.8 KB | قالب المكوّن |
| `explorer-installment-payment.scss` | 0 B | أنماط المكوّن |
| `explorer-installment-payment.spec.ts` | 669 B | اختبار وحدة (Vitest) |
| `explorer-installment-payment.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\installment\installment-proof

### `src\app\features\dashboard\pages\installment\installment-proof` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `installment-proof.html` | 31 B | قالب المكوّن |
| `installment-proof.route.ts` | 705 B | تعريف مسارات Angular |
| `installment-proof.scss` | 0 B | أنماط المكوّن |
| `installment-proof.spec.ts` | 598 B | اختبار وحدة (Vitest) |
| `installment-proof.ts` | 288 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\installment\installment-proof\add-installment-proof

### `src\app\features\dashboard\pages\installment\installment-proof\add-installment-proof` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-installment-proof.html` | 17.7 KB | قالب المكوّن |
| `add-installment-proof.scss` | 0 B | أنماط المكوّن |
| `add-installment-proof.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `add-installment-proof.ts` | 5.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\installment\installment-proof\explorer-installment-proof

### `src\app\features\dashboard\pages\installment\installment-proof\explorer-installment-proof` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-installment-proof.html` | 6.8 KB | قالب المكوّن |
| `explorer-installment-proof.scss` | 0 B | أنماط المكوّن |
| `explorer-installment-proof.spec.ts` | 655 B | اختبار وحدة (Vitest) |
| `explorer-installment-proof.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\conjugation-command

### `src\app\features\dashboard\pages\inventory\conjugation-command` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `conjugation-command.html` | 31 B | قالب المكوّن |
| `conjugation-command.route.ts` | 697 B | تعريف مسارات Angular |
| `conjugation-command.scss` | 0 B | أنماط المكوّن |
| `conjugation-command.spec.ts` | 612 B | اختبار وحدة (Vitest) |
| `conjugation-command.ts` | 296 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\conjugation-command\add-conjugation-command

### `src\app\features\dashboard\pages\inventory\conjugation-command\add-conjugation-command` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-conjugation-command.html` | 19.3 KB | قالب المكوّن |
| `add-conjugation-command.scss` | 0 B | أنماط المكوّن |
| `add-conjugation-command.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `add-conjugation-command.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\conjugation-command\exlorer-conjugation-command

### `src\app\features\dashboard\pages\inventory\conjugation-command\exlorer-conjugation-command` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `exlorer-conjugation-command.html` | 6.8 KB | قالب المكوّن |
| `exlorer-conjugation-command.scss` | 0 B | أنماط المكوّن |
| `exlorer-conjugation-command.spec.ts` | 662 B | اختبار وحدة (Vitest) |
| `exlorer-conjugation-command.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\damaged-disbursement-request

### `src\app\features\dashboard\pages\inventory\damaged-disbursement-request` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `damaged-disbursement-request.html` | 32 B | قالب المكوّن |
| `damaged-disbursement-request.routes.ts` | 724 B | تعريف مسارات Angular |
| `damaged-disbursement-request.scss` | 0 B | أنماط المكوّن |
| `damaged-disbursement-request.spec.ts` | 669 B | اختبار وحدة (Vitest) |
| `damaged-disbursement-request.ts` | 331 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\damaged-disbursement-request\add-damaged-disbursement-request

### `src\app\features\dashboard\pages\inventory\damaged-disbursement-request\add-damaged-disbursement-request` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-damaged-disbursement-request.html` | 12.5 KB | قالب المكوّن |
| `add-damaged-disbursement-request.scss` | 0 B | أنماط المكوّن |
| `add-damaged-disbursement-request.spec.ts` | 691 B | اختبار وحدة (Vitest) |
| `add-damaged-disbursement-request.ts` | 2.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\damaged-disbursement-request\explorer-damaged-disbursement-request

### `src\app\features\dashboard\pages\inventory\damaged-disbursement-request\explorer-damaged-disbursement-request` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-damaged-disbursement-request.html` | 6.7 KB | قالب المكوّن |
| `explorer-damaged-disbursement-request.scss` | 0 B | أنماط المكوّن |
| `explorer-damaged-disbursement-request.spec.ts` | 726 B | اختبار وحدة (Vitest) |
| `explorer-damaged-disbursement-request.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\inventory-adjustment

### `src\app\features\dashboard\pages\inventory\inventory-adjustment` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventory-adjustment.html` | 31 B | قالب المكوّن |
| `inventory-adjustment.route.ts` | 786 B | تعريف مسارات Angular |
| `inventory-adjustment.scss` | 0 B | أنماط المكوّن |
| `inventory-adjustment.spec.ts` | 619 B | اختبار وحدة (Vitest) |
| `inventory-adjustment.ts` | 300 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\inventory-adjustment\add-inventory-adjustment

### `src\app\features\dashboard\pages\inventory\inventory-adjustment\add-inventory-adjustment` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-inventory-adjustment.html` | 11.7 KB | قالب المكوّن |
| `add-inventory-adjustment.scss` | 0 B | أنماط المكوّن |
| `add-inventory-adjustment.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `add-inventory-adjustment.ts` | 1.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\inventory-adjustment\explorer-inventory-adjustment

### `src\app\features\dashboard\pages\inventory\inventory-adjustment\explorer-inventory-adjustment` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-inventory-adjustment.html` | 6.5 KB | قالب المكوّن |
| `explorer-inventory-adjustment.scss` | 0 B | أنماط المكوّن |
| `explorer-inventory-adjustment.spec.ts` | 676 B | اختبار وحدة (Vitest) |
| `explorer-inventory-adjustment.ts` | 1.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\inventory-adjustment-request

### `src\app\features\dashboard\pages\inventory\inventory-adjustment-request` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventory-adjustment.route.ts` | 868 B | تعريف مسارات Angular |
| `inventory-adjustment-request.html` | 32 B | قالب المكوّن |
| `inventory-adjustment-request.scss` | 0 B | أنماط المكوّن |
| `inventory-adjustment-request.spec.ts` | 669 B | اختبار وحدة (Vitest) |
| `inventory-adjustment-request.ts` | 331 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\inventory-adjustment-request\add-inventory-adjustment-request

### `src\app\features\dashboard\pages\inventory\inventory-adjustment-request\add-inventory-adjustment-request` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-inventory-adjustment-request.html` | 12.7 KB | قالب المكوّن |
| `add-inventory-adjustment-request.scss` | 0 B | أنماط المكوّن |
| `add-inventory-adjustment-request.spec.ts` | 691 B | اختبار وحدة (Vitest) |
| `add-inventory-adjustment-request.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\inventory-adjustment-request\explorer-inventory-adjustment-request

### `src\app\features\dashboard\pages\inventory\inventory-adjustment-request\explorer-inventory-adjustment-request` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-inventory-adjustment-request.html` | 6.5 KB | قالب المكوّن |
| `explorer-inventory-adjustment-request.scss` | 0 B | أنماط المكوّن |
| `explorer-inventory-adjustment-request.spec.ts` | 726 B | اختبار وحدة (Vitest) |
| `explorer-inventory-adjustment-request.ts` | 1.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\opening-balance

### `src\app\features\dashboard\pages\inventory\opening-balance` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `opening-balance.html` | 31 B | قالب المكوّن |
| `opening-balance.route.ts` | 680 B | تعريف مسارات Angular |
| `opening-balance.scss` | 0 B | أنماط المكوّن |
| `opening-balance.spec.ts` | 584 B | اختبار وحدة (Vitest) |
| `opening-balance.ts` | 280 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\opening-balance\add-opening-balance

### `src\app\features\dashboard\pages\inventory\opening-balance\add-opening-balance` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-opening-balance.html` | 14.2 KB | قالب المكوّن |
| `add-opening-balance.scss` | 0 B | أنماط المكوّن |
| `add-opening-balance.spec.ts` | 606 B | اختبار وحدة (Vitest) |
| `add-opening-balance.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\opening-balance\explorer-opening-balance

### `src\app\features\dashboard\pages\inventory\opening-balance\explorer-opening-balance` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-opening-balance.html` | 6.3 KB | قالب المكوّن |
| `explorer-opening-balance.scss` | 0 B | أنماط المكوّن |
| `explorer-opening-balance.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `explorer-opening-balance.ts` | 1.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\periodic-inventory-warehouse

### `src\app\features\dashboard\pages\inventory\periodic-inventory-warehouse` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `periodic-inventory-warehouse.html` | 31 B | قالب المكوّن |
| `periodic-inventory-warehouse.route.ts` | 809 B | تعريف مسارات Angular |
| `periodic-inventory-warehouse.scss` | 0 B | أنماط المكوّن |
| `periodic-inventory-warehouse.spec.ts` | 669 B | اختبار وحدة (Vitest) |
| `periodic-inventory-warehouse.ts` | 331 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\periodic-inventory-warehouse\add-periodic-inventory-warehouse

### `src\app\features\dashboard\pages\inventory\periodic-inventory-warehouse\add-periodic-inventory-warehouse` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-periodic-inventory-warehouse.html` | 14.2 KB | قالب المكوّن |
| `add-periodic-inventory-warehouse.scss` | 0 B | أنماط المكوّن |
| `add-periodic-inventory-warehouse.spec.ts` | 691 B | اختبار وحدة (Vitest) |
| `add-periodic-inventory-warehouse.ts` | 2.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\periodic-inventory-warehouse\explorer-periodic-inventory-warehouse

### `src\app\features\dashboard\pages\inventory\periodic-inventory-warehouse\explorer-periodic-inventory-warehouse` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-periodic-inventory-warehouse.html` | 6.3 KB | قالب المكوّن |
| `explorer-periodic-inventory-warehouse.scss` | 0 B | أنماط المكوّن |
| `explorer-periodic-inventory-warehouse.spec.ts` | 726 B | اختبار وحدة (Vitest) |
| `explorer-periodic-inventory-warehouse.ts` | 1.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\scrap

### `src\app\features\dashboard\pages\inventory\scrap` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `scrap.html` | 32 B | قالب المكوّن |
| `scrap.route.ts` | 614 B | تعريف مسارات Angular |
| `scrap.scss` | 0 B | أنماط المكوّن |
| `scrap.spec.ts` | 520 B | اختبار وحدة (Vitest) |
| `scrap.ts` | 241 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\scrap\add-scrap

### `src\app\features\dashboard\pages\inventory\scrap\add-scrap` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-scrap.html` | 13.5 KB | قالب المكوّن |
| `add-scrap.scss` | 0 B | أنماط المكوّن |
| `add-scrap.spec.ts` | 542 B | اختبار وحدة (Vitest) |
| `add-scrap.ts` | 2.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\scrap\explorer-scrap

### `src\app\features\dashboard\pages\inventory\scrap\explorer-scrap` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-scrap.html` | 6.7 KB | قالب المكوّن |
| `explorer-scrap.scss` | 0 B | أنماط المكوّن |
| `explorer-scrap.spec.ts` | 577 B | اختبار وحدة (Vitest) |
| `explorer-scrap.ts` | 1.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\supply-order

### `src\app\features\dashboard\pages\inventory\supply-order` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `supply-order.html` | 32 B | قالب المكوّن |
| `supply-order.route.ts` | 666 B | تعريف مسارات Angular |
| `supply-order.scss` | 0 B | أنماط المكوّن |
| `supply-order.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `supply-order.ts` | 268 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\supply-order\add-supply-order

### `src\app\features\dashboard\pages\inventory\supply-order\add-supply-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-supply-order.html` | 19.3 KB | قالب المكوّن |
| `add-supply-order.scss` | 0 B | أنماط المكوّن |
| `add-supply-order.spec.ts` | 585 B | اختبار وحدة (Vitest) |
| `add-supply-order.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\inventory\supply-order\explorer-supply-order

### `src\app\features\dashboard\pages\inventory\supply-order\explorer-supply-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-supply-order.html` | 6.8 KB | قالب المكوّن |
| `explorer-supply-order.scss` | 0 B | أنماط المكوّن |
| `explorer-supply-order.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `explorer-supply-order.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products

### `src\app\features\dashboard\pages\products` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `products.html` | 32 B | قالب المكوّن |
| `products.routes.ts` | 1.5 KB | تعريف مسارات Angular |
| `products.scss` | 0 B | أنماط المكوّن |
| `products.spec.ts` | 550 B | اختبار وحدة (Vitest) |
| `products.ts` | 253 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\categories

### `src\app\features\dashboard\pages\products\categories` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `categories.html` | 10.5 KB | قالب المكوّن |
| `categories.scss` | 0 B | أنماط المكوّن |
| `categories.spec.ts` | 555 B | اختبار وحدة (Vitest) |
| `categories.ts` | 7.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\categories\models

### `src\app\features\dashboard\pages\products\categories\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `categories.ts` | 305 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\categories\services

### `src\app\features\dashboard\pages\products\categories\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `categories-services.spec.ts` | 382 B | اختبار وحدة (Vitest) |
| `categories-services.ts` | 469 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\products\groups

### `src\app\features\dashboard\pages\products\groups` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `groups.html` | 5.4 KB | قالب المكوّن |
| `groups.scss` | 66 B | أنماط المكوّن |
| `groups.spec.ts` | 527 B | اختبار وحدة (Vitest) |
| `groups.ts` | 7.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\groups\models

### `src\app\features\dashboard\pages\products\groups\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `group.ts` | 318 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\groups\services

### `src\app\features\dashboard\pages\products\groups\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `groups.spec.ts` | 321 B | اختبار وحدة (Vitest) |
| `groups.ts` | 527 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\inventories

### `src\app\features\dashboard\pages\products\inventories` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventories.html` | 4.7 KB | قالب المكوّن |
| `inventories.scss` | 66 B | أنماط المكوّن |
| `inventories.spec.ts` | 562 B | اختبار وحدة (Vitest) |
| `inventories.ts` | 7.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\inventories\models

### `src\app\features\dashboard\pages\products\inventories\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventories.ts` | 353 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\inventories\services

### `src\app\features\dashboard\pages\products\inventories\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventories-services.spec.ts` | 387 B | اختبار وحدة (Vitest) |
| `inventories-services.ts` | 473 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\products\product-card

### `src\app\features\dashboard\pages\products\product-card` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `product-card.html` | 31 B | قالب المكوّن |
| `product-card.scss` | 537 B | أنماط المكوّن |
| `product-card.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `product-card.ts` | 2.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\product-card\add-product

### `src\app\features\dashboard\pages\products\product-card\add-product` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-product.html` | 36.6 KB | قالب المكوّن |
| `add-product.scss` | 0 B | أنماط المكوّن |
| `add-product.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `add-product.ts` | 23.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\product-card\explorer-product

### `src\app\features\dashboard\pages\products\product-card\explorer-product` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-product.html` | 6.2 KB | قالب المكوّن |
| `explorer-product.scss` | 1.5 KB | أنماط المكوّن |
| `explorer-product.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `explorer-product.ts` | 4.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\product-card\models

### `src\app\features\dashboard\pages\products\product-card\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `product-card.ts` | 766 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\product-card\services

### `src\app\features\dashboard\pages\products\product-card\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `product-card.spec.ts` | 347 B | اختبار وحدة (Vitest) |
| `product-card.ts` | 500 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\units-of-measurement

### `src\app\features\dashboard\pages\products\units-of-measurement` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `units-of-measurement.html` | 5.1 KB | قالب المكوّن |
| `units-of-measurement.scss` | 66 B | أنماط المكوّن |
| `units-of-measurement.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `units-of-measurement.ts` | 7.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\units-of-measurement\models

### `src\app\features\dashboard\pages\products\units-of-measurement\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `unit-of-meaure.ts` | 306 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\products\units-of-measurement\services

### `src\app\features\dashboard\pages\products\units-of-measurement\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `unit-of-measure.spec.ts` | 358 B | اختبار وحدة (Vitest) |
| `unit-of-measure.ts` | 468 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\multiply-purchase-returns

### `src\app\features\dashboard\pages\purchase-returns\multiply-purchase-returns` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `multiply-purchase-returns.html` | 31 B | قالب المكوّن |
| `multiply-purchase-returns.routes.ts` | 757 B | تعريف مسارات Angular |
| `multiply-purchase-returns.scss` | 0 B | أنماط المكوّن |
| `multiply-purchase-returns.spec.ts` | 648 B | اختبار وحدة (Vitest) |
| `multiply-purchase-returns.ts` | 319 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\multiply-purchase-returns\add-multiply-purchase-returns

### `src\app\features\dashboard\pages\purchase-returns\multiply-purchase-returns\add-multiply-purchase-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-multiply-purchase-returns.html` | 17.3 KB | قالب المكوّن |
| `add-multiply-purchase-returns.scss` | 0 B | أنماط المكوّن |
| `add-multiply-purchase-returns.spec.ts` | 670 B | اختبار وحدة (Vitest) |
| `add-multiply-purchase-returns.ts` | 2.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\multiply-purchase-returns\explorer-multiply-purchase-returns

### `src\app\features\dashboard\pages\purchase-returns\multiply-purchase-returns\explorer-multiply-purchase-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-multiply-purchase-returns.html` | 6.6 KB | قالب المكوّن |
| `explorer-multiply-purchase-returns.scss` | 0 B | أنماط المكوّن |
| `explorer-multiply-purchase-returns.spec.ts` | 705 B | اختبار وحدة (Vitest) |
| `explorer-multiply-purchase-returns.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-invoice-draft

### `src\app\features\dashboard\pages\purchase-returns\purchase-invoice-draft` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-invoice-draft.html` | 13.6 KB | قالب المكوّن |
| `purchase-invoice-draft.route.ts` | 243 B | تعريف مسارات Angular |
| `purchase-invoice-draft.scss` | 0 B | أنماط المكوّن |
| `purchase-invoice-draft.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `purchase-invoice-draft.ts` | 2.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-returns

### `src\app\features\dashboard\pages\purchase-returns\purchase-returns` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-returns.html` | 31 B | قالب المكوّن |
| `purchase-returns.routes.ts` | 721 B | تعريف مسارات Angular |
| `purchase-returns.scss` | 0 B | أنماط المكوّن |
| `purchase-returns.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `purchase-returns.ts` | 404 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-returns\add-purchase-returns

### `src\app\features\dashboard\pages\purchase-returns\purchase-returns\add-purchase-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-purchase-returns.html` | 29.6 KB | قالب المكوّن |
| `add-purchase-returns.scss` | 0 B | أنماط المكوّن |
| `add-purchase-returns.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `add-purchase-returns.ts` | 4.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-returns\explorer-purchase-returns

### `src\app\features\dashboard\pages\purchase-returns\purchase-returns\explorer-purchase-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-purchase-returns.html` | 6.9 KB | قالب المكوّن |
| `explorer-purchase-returns.scss` | 0 B | أنماط المكوّن |
| `explorer-purchase-returns.spec.ts` | 648 B | اختبار وحدة (Vitest) |
| `explorer-purchase-returns.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-returns-without-invoice-number

### `src\app\features\dashboard\pages\purchase-returns\purchase-returns-without-invoice-number` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-returns-without-invoice-number.html` | 31 B | قالب المكوّن |
| `purchase-returns-without-invoice-number.routes.ts` | 860 B | تعريف مسارات Angular |
| `purchase-returns-without-invoice-number.scss` | 0 B | أنماط المكوّن |
| `purchase-returns-without-invoice-number.spec.ts` | 734 B | اختبار وحدة (Vitest) |
| `purchase-returns-without-invoice-number.ts` | 373 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-returns-without-invoice-number\add-purchase-returns-without-invoice-number

### `src\app\features\dashboard\pages\purchase-returns\purchase-returns-without-invoice-number\add-purchase-returns-without-invoice-number` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-purchase-returns-without-invoice-number.html` | 26.7 KB | قالب المكوّن |
| `add-purchase-returns-without-invoice-number.scss` | 0 B | أنماط المكوّن |
| `add-purchase-returns-without-invoice-number.spec.ts` | 756 B | اختبار وحدة (Vitest) |
| `add-purchase-returns-without-invoice-number.ts` | 5.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchase-returns\purchase-returns-without-invoice-number\explorer-purchase-returns-without-invoice-number

### `src\app\features\dashboard\pages\purchase-returns\purchase-returns-without-invoice-number\explorer-purchase-returns-without-invoice-number` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-purchase-returns-without-invoice-number.html` | 7.0 KB | قالب المكوّن |
| `explorer-purchase-returns-without-invoice-number.scss` | 0 B | أنماط المكوّن |
| `explorer-purchase-returns-without-invoice-number.spec.ts` | 791 B | اختبار وحدة (Vitest) |
| `explorer-purchase-returns-without-invoice-number.ts` | 1.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\autometed-purchase-order

### `src\app\features\dashboard\pages\purchases\autometed-purchase-order` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `autometed-purchase-order.html` | 31 B | قالب المكوّن |
| `autometed-purchase-order.route.ts` | 783 B | تعريف مسارات Angular |
| `autometed-purchase-order.scss` | 0 B | أنماط المكوّن |
| `autometed-purchase-order.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `autometed-purchase-order.ts` | 315 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\autometed-purchase-order\add-autometed-purchase-order

### `src\app\features\dashboard\pages\purchases\autometed-purchase-order\add-autometed-purchase-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-autometed-purchase-order.html` | 19.1 KB | قالب المكوّن |
| `add-autometed-purchase-order.scss` | 0 B | أنماط المكوّن |
| `add-autometed-purchase-order.spec.ts` | 663 B | اختبار وحدة (Vitest) |
| `add-autometed-purchase-order.ts` | 2.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\autometed-purchase-order\explorer-autometed-purchase-order

### `src\app\features\dashboard\pages\purchases\autometed-purchase-order\explorer-autometed-purchase-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-autometed-purchase-order.html` | 4.2 KB | قالب المكوّن |
| `explorer-autometed-purchase-order.scss` | 59 B | أنماط المكوّن |
| `explorer-autometed-purchase-order.spec.ts` | 698 B | اختبار وحدة (Vitest) |
| `explorer-autometed-purchase-order.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\international-purchase-invoice

### `src\app\features\dashboard\pages\purchases\international-purchase-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `international-purchase-invoice.html` | 32 B | قالب المكوّن |
| `international-purchase-invoice.route.ts` | 846 B | تعريف مسارات Angular |
| `international-purchase-invoice.scss` | 0 B | أنماط المكوّن |
| `international-purchase-invoice.spec.ts` | 683 B | اختبار وحدة (Vitest) |
| `international-purchase-invoice.ts` | 339 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\international-purchase-invoice\add-international-purchase-invoice

### `src\app\features\dashboard\pages\purchases\international-purchase-invoice\add-international-purchase-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-international-purchase-invoice.html` | 21.5 KB | قالب المكوّن |
| `add-international-purchase-invoice.scss` | 0 B | أنماط المكوّن |
| `add-international-purchase-invoice.spec.ts` | 705 B | اختبار وحدة (Vitest) |
| `add-international-purchase-invoice.ts` | 5.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\international-purchase-invoice\explorer-international-purchase-invoice

### `src\app\features\dashboard\pages\purchases\international-purchase-invoice\explorer-international-purchase-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-international-purchase-invoice.html` | 6.8 KB | قالب المكوّن |
| `explorer-international-purchase-invoice.scss` | 0 B | أنماط المكوّن |
| `explorer-international-purchase-invoice.spec.ts` | 740 B | اختبار وحدة (Vitest) |
| `explorer-international-purchase-invoice.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-invoice

### `src\app\features\dashboard\pages\purchases\purchase-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-invoice.html` | 31 B | قالب المكوّن |
| `purchase-invoice.route.ts` | 708 B | تعريف مسارات Angular |
| `purchase-invoice.scss` | 0 B | أنماط المكوّن |
| `purchase-invoice.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `purchase-invoice.ts` | 284 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-invoice\add-purchase-invoice

### `src\app\features\dashboard\pages\purchases\purchase-invoice\add-purchase-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-purchase-invoice.html` | 53.9 KB | قالب المكوّن |
| `add-purchase-invoice.scss` | 172 B | أنماط المكوّن |
| `add-purchase-invoice.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `add-purchase-invoice.ts` | 40.2 KB | ملف TypeScript |
| `html` | 0 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-invoice\explorer-purchase-invoice

### `src\app\features\dashboard\pages\purchases\purchase-invoice\explorer-purchase-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-purchase-invoice.html` | 7.3 KB | قالب المكوّن |
| `explorer-purchase-invoice.scss` | 0 B | أنماط المكوّن |
| `explorer-purchase-invoice.spec.ts` | 648 B | اختبار وحدة (Vitest) |
| `explorer-purchase-invoice.ts` | 5.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-invoice\models

### `src\app\features\dashboard\pages\purchases\purchase-invoice\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-invoice.ts` | 2.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-invoice\services

### `src\app\features\dashboard\pages\purchases\purchase-invoice\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase.spec.ts` | 331 B | اختبار وحدة (Vitest) |
| `purchase.ts` | 3.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-order

### `src\app\features\dashboard\pages\purchases\purchase-order` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-order.html` | 31 B | قالب المكوّن |
| `purchase-order.route.ts` | 690 B | تعريف مسارات Angular |
| `purchase-order.scss` | 0 B | أنماط المكوّن |
| `purchase-order.spec.ts` | 577 B | اختبار وحدة (Vitest) |
| `purchase-order.ts` | 513 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-order\add-purchase-order

### `src\app\features\dashboard\pages\purchases\purchase-order\add-purchase-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-purchase-order.html` | 15.8 KB | قالب المكوّن |
| `add-purchase-order.scss` | 149 B | أنماط المكوّن |
| `add-purchase-order.spec.ts` | 599 B | اختبار وحدة (Vitest) |
| `add-purchase-order.ts` | 17.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-order\explorer-purchase-order

### `src\app\features\dashboard\pages\purchases\purchase-order\explorer-purchase-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-purchase-order.html` | 4.6 KB | قالب المكوّن |
| `explorer-purchase-order.scss` | 124 B | أنماط المكوّن |
| `explorer-purchase-order.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `explorer-purchase-order.ts` | 5.9 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\purchases\purchase-order\services

### `src\app\features\dashboard\pages\purchases\purchase-order\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `purchase-order-service.spec.ts` | 393 B | اختبار وحدة (Vitest) |
| `purchase-order-service.ts` | 549 B | خدمة API / منطق أعمال |

## 📁 src\app\features\dashboard\pages\qr-code\qrcode-printer

### `src\app\features\dashboard\pages\qr-code\qrcode-printer` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `qrcode-printer.html` | 31 B | قالب المكوّن |
| `qrcode-printer.route.ts` | 673 B | تعريف مسارات Angular |
| `qrcode-printer.scss` | 0 B | أنماط المكوّن |
| `qrcode-printer.spec.ts` | 577 B | اختبار وحدة (Vitest) |
| `qrcode-printer.ts` | 276 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\qr-code\qrcode-printer\add-qrcode-printer

### `src\app\features\dashboard\pages\qr-code\qrcode-printer\add-qrcode-printer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-qrcode-printer.html` | 7.7 KB | قالب المكوّن |
| `add-qrcode-printer.scss` | 0 B | أنماط المكوّن |
| `add-qrcode-printer.spec.ts` | 599 B | اختبار وحدة (Vitest) |
| `add-qrcode-printer.ts` | 2.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\qr-code\qrcode-printer\explorer-qrcode-printer

### `src\app\features\dashboard\pages\qr-code\qrcode-printer\explorer-qrcode-printer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-qrcode-printer.html` | 6.4 KB | قالب المكوّن |
| `explorer-qrcode-printer.scss` | 0 B | أنماط المكوّن |
| `explorer-qrcode-printer.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `explorer-qrcode-printer.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables

### `src\app\features\dashboard\pages\Receivables` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `receivables.html` | 31 B | قالب المكوّن |
| `receivables.route.ts` | 597 B | تعريف مسارات Angular |
| `receivables.scss` | 0 B | أنماط المكوّن |
| `receivables.spec.ts` | 574 B | اختبار وحدة (Vitest) |
| `receivables.ts` | 265 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables\multiply-receipt-voucher

### `src\app\features\dashboard\pages\Receivables\multiply-receipt-voucher` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `multiply-receipt-voucher.html` | 31 B | قالب المكوّن |
| `multiply-receipt-voucher.route.ts` | 769 B | تعريف مسارات Angular |
| `multiply-receipt-voucher.scss` | 0 B | أنماط المكوّن |
| `multiply-receipt-voucher.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `multiply-receipt-voucher.ts` | 315 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables\multiply-receipt-voucher\add-multiply-receipt-voucher

### `src\app\features\dashboard\pages\Receivables\multiply-receipt-voucher\add-multiply-receipt-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-multiply-receipt-voucher.html` | 22.7 KB | قالب المكوّن |
| `add-multiply-receipt-voucher.scss` | 0 B | أنماط المكوّن |
| `add-multiply-receipt-voucher.spec.ts` | 663 B | اختبار وحدة (Vitest) |
| `add-multiply-receipt-voucher.ts` | 2.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables\multiply-receipt-voucher\explorer-multiply-receipt-voucher

### `src\app\features\dashboard\pages\Receivables\multiply-receipt-voucher\explorer-multiply-receipt-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-multiply-receipt-voucher.html` | 2.9 KB | قالب المكوّن |
| `explorer-multiply-receipt-voucher.scss` | 0 B | أنماط المكوّن |
| `explorer-multiply-receipt-voucher.spec.ts` | 698 B | اختبار وحدة (Vitest) |
| `explorer-multiply-receipt-voucher.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables\receipt-voucher

### `src\app\features\dashboard\pages\Receivables\receipt-voucher` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `receipt-voucher.html` | 31 B | قالب المكوّن |
| `receipt-voucher.route.ts` | 619 B | تعريف مسارات Angular |
| `receipt-voucher.scss` | 0 B | أنماط المكوّن |
| `receipt-voucher.spec.ts` | 584 B | اختبار وحدة (Vitest) |
| `receipt-voucher.ts` | 280 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables\receipt-voucher\add-receipt-voucher

### `src\app\features\dashboard\pages\Receivables\receipt-voucher\add-receipt-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-receipt-voucher.html` | 18.5 KB | قالب المكوّن |
| `add-receipt-voucher.scss` | 0 B | أنماط المكوّن |
| `add-receipt-voucher.spec.ts` | 606 B | اختبار وحدة (Vitest) |
| `add-receipt-voucher.ts` | 2.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Receivables\receipt-voucher\explorer-receipt-voucher

### `src\app\features\dashboard\pages\Receivables\receipt-voucher\explorer-receipt-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-receipt-voucher.html` | 2.9 KB | قالب المكوّن |
| `explorer-receipt-voucher.scss` | 0 B | أنماط المكوّن |
| `explorer-receipt-voucher.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `explorer-receipt-voucher.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\delivery-goods

### `src\app\features\dashboard\pages\sales\delivery-goods` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `delivery-goods.html` | 31 B | قالب المكوّن |
| `delivery-goods.routes.ts` | 717 B | تعريف مسارات Angular |
| `delivery-goods.scss` | 0 B | أنماط المكوّن |
| `delivery-goods.spec.ts` | 577 B | اختبار وحدة (Vitest) |
| `delivery-goods.ts` | 277 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\delivery-goods\add-delivery-goods

### `src\app\features\dashboard\pages\sales\delivery-goods\add-delivery-goods` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-delivery-goods.html` | 15.5 KB | قالب المكوّن |
| `add-delivery-goods.scss` | 0 B | أنماط المكوّن |
| `add-delivery-goods.spec.ts` | 599 B | اختبار وحدة (Vitest) |
| `add-delivery-goods.ts` | 2.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\delivery-goods\explorer-delivery-goods

### `src\app\features\dashboard\pages\sales\delivery-goods\explorer-delivery-goods` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-delivery-goods.html` | 6.6 KB | قالب المكوّن |
| `explorer-delivery-goods.scss` | 0 B | أنماط المكوّن |
| `explorer-delivery-goods.spec.ts` | 634 B | اختبار وحدة (Vitest) |
| `explorer-delivery-goods.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\depit-notification

### `src\app\features\dashboard\pages\sales\depit-notification` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `depit-notification.html` | 31 B | قالب المكوّن |
| `depit-notification.routes.ts` | 726 B | تعريف مسارات Angular |
| `depit-notification.scss` | 0 B | أنماط المكوّن |
| `depit-notification.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `depit-notification.ts` | 292 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\depit-notification\add-depit-notification

### `src\app\features\dashboard\pages\sales\depit-notification\add-depit-notification` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-depit-notification.html` | 14.3 KB | قالب المكوّن |
| `add-depit-notification.scss` | 0 B | أنماط المكوّن |
| `add-depit-notification.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `add-depit-notification.ts` | 5.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\depit-notification\explorer-depit-notification

### `src\app\features\dashboard\pages\sales\depit-notification\explorer-depit-notification` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-depit-notification.html` | 6.9 KB | قالب المكوّن |
| `explorer-depit-notification.scss` | 0 B | أنماط المكوّن |
| `explorer-depit-notification.spec.ts` | 662 B | اختبار وحدة (Vitest) |
| `explorer-depit-notification.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\disbursing-reservations

### `src\app\features\dashboard\pages\sales\disbursing-reservations` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `disbursing-reservations.html` | 13.6 KB | قالب المكوّن |
| `disbursing-reservations.routes.ts` | 253 B | تعريف مسارات Angular |
| `disbursing-reservations.scss` | 0 B | أنماط المكوّن |
| `disbursing-reservations.spec.ts` | 640 B | اختبار وحدة (Vitest) |
| `disbursing-reservations.ts` | 4.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\display-sales-prices

### `src\app\features\dashboard\pages\sales\display-sales-prices` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `display-sales-prices.html` | 31 B | قالب المكوّن |
| `display-sales-prices.route.ts` | 738 B | تعريف مسارات Angular |
| `display-sales-prices.scss` | 0 B | أنماط المكوّن |
| `display-sales-prices.spec.ts` | 613 B | اختبار وحدة (Vitest) |
| `display-sales-prices.ts` | 299 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\display-sales-prices\add-display-sales-prices

### `src\app\features\dashboard\pages\sales\display-sales-prices\add-display-sales-prices` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-display-sales-prices.html` | 27.8 KB | قالب المكوّن |
| `add-display-sales-prices.scss` | 0 B | أنماط المكوّن |
| `add-display-sales-prices.spec.ts` | 635 B | اختبار وحدة (Vitest) |
| `add-display-sales-prices.ts` | 5.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\display-sales-prices\explorer-display-sales-prices

### `src\app\features\dashboard\pages\sales\display-sales-prices\explorer-display-sales-prices` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-display-sales-prices.html` | 6.6 KB | قالب المكوّن |
| `explorer-display-sales-prices.scss` | 0 B | أنماط المكوّن |
| `explorer-display-sales-prices.spec.ts` | 670 B | اختبار وحدة (Vitest) |
| `explorer-display-sales-prices.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\quick-sales-point-cashiers

### `src\app\features\dashboard\pages\sales\quick-sales-point-cashiers` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `quick-sales-point-cashiers.html` | 31 B | قالب المكوّن |
| `quick-sales-point-cashiers.routes.ts` | 1.0 KB | تعريف مسارات Angular |
| `quick-sales-point-cashiers.scss` | 0 B | أنماط المكوّن |
| `quick-sales-point-cashiers.spec.ts` | 649 B | اختبار وحدة (Vitest) |
| `quick-sales-point-cashiers.ts` | 322 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\quick-sales-point-cashiers\add-quick-sales-point-cashiers

### `src\app\features\dashboard\pages\sales\quick-sales-point-cashiers\add-quick-sales-point-cashiers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-quick-sales-point-cashiers.html` | 23.1 KB | قالب المكوّن |
| `add-quick-sales-point-cashiers.scss` | 372 B | أنماط المكوّن |
| `add-quick-sales-point-cashiers.spec.ts` | 671 B | اختبار وحدة (Vitest) |
| `add-quick-sales-point-cashiers.ts` | 5.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\quick-sales-point-cashiers\explorer-quick-sales-point-cashiers

### `src\app\features\dashboard\pages\sales\quick-sales-point-cashiers\explorer-quick-sales-point-cashiers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-quick-sales-point-cashiers.html` | 6.8 KB | قالب المكوّن |
| `explorer-quick-sales-point-cashiers.scss` | 0 B | أنماط المكوّن |
| `explorer-quick-sales-point-cashiers.spec.ts` | 706 B | اختبار وحدة (Vitest) |
| `explorer-quick-sales-point-cashiers.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\quick-sales-point-cashiers\query-quick-sales-point-cashiers

### `src\app\features\dashboard\pages\sales\quick-sales-point-cashiers\query-quick-sales-point-cashiers` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `query-quick-sales-point-cashiers.html` | 16.4 KB | قالب المكوّن |
| `query-quick-sales-point-cashiers.scss` | 546 B | أنماط المكوّن |
| `query-quick-sales-point-cashiers.spec.ts` | 685 B | اختبار وحدة (Vitest) |
| `query-quick-sales-point-cashiers.ts` | 4.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\sales-invoice

### `src\app\features\dashboard\pages\sales\sales-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sales-invoice.html` | 33 B | قالب المكوّن |
| `sales-invoice.routes.ts` | 671 B | تعريف مسارات Angular |
| `sales-invoice.scss` | 0 B | أنماط المكوّن |
| `sales-invoice.spec.ts` | 570 B | اختبار وحدة (Vitest) |
| `sales-invoice.ts` | 272 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\sales-invoice\add-sales-invoice

### `src\app\features\dashboard\pages\sales\sales-invoice\add-sales-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-sales-invoice.html` | 30.4 KB | قالب المكوّن |
| `add-sales-invoice.scss` | 0 B | أنماط المكوّن |
| `add-sales-invoice.spec.ts` | 592 B | اختبار وحدة (Vitest) |
| `add-sales-invoice.ts` | 5.8 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales\sales-invoice\explorer-sales-invoice

### `src\app\features\dashboard\pages\sales\sales-invoice\explorer-sales-invoice` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-sales-invoice.html` | 6.8 KB | قالب المكوّن |
| `explorer-sales-invoice.scss` | 0 B | أنماط المكوّن |
| `explorer-sales-invoice.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `explorer-sales-invoice.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\draft-sales-invoice

### `src\app\features\dashboard\pages\sales-returns\draft-sales-invoice` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `draft-sales-invoice.html` | 13.5 KB | قالب المكوّن |
| `draft-sales-invoice.routes.ts` | 236 B | تعريف مسارات Angular |
| `draft-sales-invoice.scss` | 0 B | أنماط المكوّن |
| `draft-sales-invoice.spec.ts` | 606 B | اختبار وحدة (Vitest) |
| `draft-sales-invoice.ts` | 2.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\multiply-sales-returns

### `src\app\features\dashboard\pages\sales-returns\multiply-sales-returns` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `multiply-sales.routes.ts` | 748 B | تعريف مسارات Angular |
| `multiply-sales-returns.html` | 31 B | قالب المكوّن |
| `multiply-sales-returns.scss` | 0 B | أنماط المكوّن |
| `multiply-sales-returns.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `multiply-sales-returns.ts` | 307 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\multiply-sales-returns\add-multiply-sales-returns

### `src\app\features\dashboard\pages\sales-returns\multiply-sales-returns\add-multiply-sales-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-multiply-sales-returns.html` | 13.1 KB | قالب المكوّن |
| `add-multiply-sales-returns.scss` | 0 B | أنماط المكوّن |
| `add-multiply-sales-returns.spec.ts` | 649 B | اختبار وحدة (Vitest) |
| `add-multiply-sales-returns.ts` | 2.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\multiply-sales-returns\explorer-multiply-sales-returns

### `src\app\features\dashboard\pages\sales-returns\multiply-sales-returns\explorer-multiply-sales-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-multiply-sales-returns.html` | 6.6 KB | قالب المكوّن |
| `explorer-multiply-sales-returns.scss` | 0 B | أنماط المكوّن |
| `explorer-multiply-sales-returns.spec.ts` | 684 B | اختبار وحدة (Vitest) |
| `explorer-multiply-sales-returns.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\payment-voucher

### `src\app\features\dashboard\pages\sales-returns\payment-voucher` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `payment-voucher.html` | 32 B | قالب المكوّن |
| `payment-voucher.routes.ts` | 633 B | تعريف مسارات Angular |
| `payment-voucher.scss` | 0 B | أنماط المكوّن |
| `payment-voucher.spec.ts` | 584 B | اختبار وحدة (Vitest) |
| `payment-voucher.ts` | 280 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\payment-voucher\add-payment-voucher

### `src\app\features\dashboard\pages\sales-returns\payment-voucher\add-payment-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-payment-voucher.html` | 17.1 KB | قالب المكوّن |
| `add-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `add-payment-voucher.spec.ts` | 606 B | اختبار وحدة (Vitest) |
| `add-payment-voucher.ts` | 6.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\payment-voucher\explorer-payment-voucher

### `src\app\features\dashboard\pages\sales-returns\payment-voucher\explorer-payment-voucher` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-payment-voucher.html` | 6.6 KB | قالب المكوّن |
| `explorer-payment-voucher.scss` | 0 B | أنماط المكوّن |
| `explorer-payment-voucher.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `explorer-payment-voucher.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\sales-returns

### `src\app\features\dashboard\pages\sales-returns\sales-returns` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sales-returns.html` | 31 B | قالب المكوّن |
| `sales-returns.scss` | 0 B | أنماط المكوّن |
| `sales-returns.spec.ts` | 570 B | اختبار وحدة (Vitest) |
| `sales-returns.ts` | 272 B | ملف TypeScript |
| `sales-returns-page.routes.ts` | 539 B | تعريف مسارات Angular |

## 📁 src\app\features\dashboard\pages\sales-returns\sales-returns\add-sales-returns

### `src\app\features\dashboard\pages\sales-returns\sales-returns\add-sales-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-sales-returns.html` | 14.1 KB | قالب المكوّن |
| `add-sales-returns.scss` | 0 B | أنماط المكوّن |
| `add-sales-returns.spec.ts` | 592 B | اختبار وحدة (Vitest) |
| `add-sales-returns.ts` | 4.3 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\sales-returns\sales-returns\explorer-sales-returns

### `src\app\features\dashboard\pages\sales-returns\sales-returns\explorer-sales-returns` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-sales-returns.html` | 6.8 KB | قالب المكوّن |
| `explorer-sales-returns.scss` | 0 B | أنماط المكوّن |
| `explorer-sales-returns.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `explorer-sales-returns.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\settings

### `src\app\features\dashboard\pages\settings` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `settings.html` | 31 B | قالب المكوّن |
| `settings.routes.ts` | 580 B | تعريف مسارات Angular |
| `settings.scss` | 0 B | أنماط المكوّن |
| `settings.spec.ts` | 541 B | اختبار وحدة (Vitest) |
| `settings.ts` | 253 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\settings\branch-settings

### `src\app\features\dashboard\pages\settings\branch-settings` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `branch-settings.html` | 11.2 KB | قالب المكوّن |
| `branch-settings.scss` | 0 B | أنماط المكوّن |
| `branch-settings.spec.ts` | 584 B | اختبار وحدة (Vitest) |
| `branch-settings.ts` | 813 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\settings\company-settings

### `src\app\features\dashboard\pages\settings\company-settings` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `company-settings.html` | 2.3 KB | قالب المكوّن |
| `company-settings.scss` | 0 B | أنماط المكوّن |
| `company-settings.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `company-settings.ts` | 2.4 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\incomming-transfer

### `src\app\features\dashboard\pages\Transfers\incomming-transfer` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `incomming-transfer.html` | 31 B | قالب المكوّن |
| `incomming-transfer.route.ts` | 713 B | تعريف مسارات Angular |
| `incomming-transfer.scss` | 0 B | أنماط المكوّن |
| `incomming-transfer.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `incomming-transfer.ts` | 296 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\incomming-transfer\add-incomming-transfer

### `src\app\features\dashboard\pages\Transfers\incomming-transfer\add-incomming-transfer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-incomming-transfer.html` | 13.6 KB | قالب المكوّن |
| `add-incomming-transfer.scss` | 0 B | أنماط المكوّن |
| `add-incomming-transfer.spec.ts` | 627 B | اختبار وحدة (Vitest) |
| `add-incomming-transfer.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\incomming-transfer\explorer-incomming-transfer

### `src\app\features\dashboard\pages\Transfers\incomming-transfer\explorer-incomming-transfer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-incomming-transfer.html` | 6.6 KB | قالب المكوّن |
| `explorer-incomming-transfer.scss` | 0 B | أنماط المكوّن |
| `explorer-incomming-transfer.spec.ts` | 662 B | اختبار وحدة (Vitest) |
| `explorer-incomming-transfer.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\internal-exchange-permit

### `src\app\features\dashboard\pages\Transfers\internal-exchange-permit` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `internal-exchange.route.ts` | 673 B | تعريف مسارات Angular |
| `internal-exchange-permit.html` | 31 B | قالب المكوّن |
| `internal-exchange-permit.scss` | 0 B | أنماط المكوّن |
| `internal-exchange-permit.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `internal-exchange-permit.ts` | 315 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\internal-exchange-permit\add-internal-exchange-permit

### `src\app\features\dashboard\pages\Transfers\internal-exchange-permit\add-internal-exchange-permit` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-internal-exchange-permit.html` | 13.6 KB | قالب المكوّن |
| `add-internal-exchange-permit.scss` | 0 B | أنماط المكوّن |
| `add-internal-exchange-permit.spec.ts` | 663 B | اختبار وحدة (Vitest) |
| `add-internal-exchange-permit.ts` | 2.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\internal-exchange-permit\explorer-internal-exchange-permit

### `src\app\features\dashboard\pages\Transfers\internal-exchange-permit\explorer-internal-exchange-permit` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-internal-exchange-permit.html` | 6.6 KB | قالب المكوّن |
| `explorer-internal-exchange-permit.scss` | 0 B | أنماط المكوّن |
| `explorer-internal-exchange-permit.spec.ts` | 698 B | اختبار وحدة (Vitest) |
| `explorer-internal-exchange-permit.ts` | 1.6 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\inventory-transfer-order

### `src\app\features\dashboard\pages\Transfers\inventory-transfer-order` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventory-transfer-order.html` | 31 B | قالب المكوّن |
| `inventory-transfer-order.route.ts` | 765 B | تعريف مسارات Angular |
| `inventory-transfer-order.scss` | 0 B | أنماط المكوّن |
| `inventory-transfer-order.spec.ts` | 641 B | اختبار وحدة (Vitest) |
| `inventory-transfer-order.ts` | 315 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\inventory-transfer-order\add-inventory-transfer-order

### `src\app\features\dashboard\pages\Transfers\inventory-transfer-order\add-inventory-transfer-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-inventory-transfer-order.html` | 11.3 KB | قالب المكوّن |
| `add-inventory-transfer-order.scss` | 0 B | أنماط المكوّن |
| `add-inventory-transfer-order.spec.ts` | 663 B | اختبار وحدة (Vitest) |
| `add-inventory-transfer-order.ts` | 2.0 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\inventory-transfer-order\explorer-inventory-transfer-order

### `src\app\features\dashboard\pages\Transfers\inventory-transfer-order\explorer-inventory-transfer-order` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-inventory-transfer-order.html` | 6.6 KB | قالب المكوّن |
| `explorer-inventory-transfer-order.scss` | 0 B | أنماط المكوّن |
| `explorer-inventory-transfer-order.spec.ts` | 698 B | اختبار وحدة (Vitest) |
| `explorer-inventory-transfer-order.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\inventory-transfer-receive

### `src\app\features\dashboard\pages\Transfers\inventory-transfer-receive` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `inventory-transfer-receive.html` | 32 B | قالب المكوّن |
| `inventory-transfer-receive.route.ts` | 797 B | تعريف مسارات Angular |
| `inventory-transfer-receive.scss` | 0 B | أنماط المكوّن |
| `inventory-transfer-receive.spec.ts` | 655 B | اختبار وحدة (Vitest) |
| `inventory-transfer-receive.ts` | 323 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\inventory-transfer-receive\add-inventory-transfer-receive

### `src\app\features\dashboard\pages\Transfers\inventory-transfer-receive\add-inventory-transfer-receive` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-inventory-transfer-receive.html` | 10.9 KB | قالب المكوّن |
| `add-inventory-transfer-receive.scss` | 0 B | أنماط المكوّن |
| `add-inventory-transfer-receive.spec.ts` | 677 B | اختبار وحدة (Vitest) |
| `add-inventory-transfer-receive.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\inventory-transfer-receive\explorer-inventory-transfer-receive

### `src\app\features\dashboard\pages\Transfers\inventory-transfer-receive\explorer-inventory-transfer-receive` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-inventory-transfer-receive.html` | 6.6 KB | قالب المكوّن |
| `explorer-inventory-transfer-receive.scss` | 0 B | أنماط المكوّن |
| `explorer-inventory-transfer-receive.spec.ts` | 712 B | اختبار وحدة (Vitest) |
| `explorer-inventory-transfer-receive.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\transfer-between-repositry

### `src\app\features\dashboard\pages\Transfers\transfer-between-repositry` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `transfer-between-repositry.html` | 31 B | قالب المكوّن |
| `transfer-between-repositry.route.ts` | 752 B | تعريف مسارات Angular |
| `transfer-between-repositry.scss` | 0 B | أنماط المكوّن |
| `transfer-between-repositry.spec.ts` | 655 B | اختبار وحدة (Vitest) |
| `transfer-between-repositry.ts` | 323 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\transfer-between-repositry\add-transfer-between-repositry

### `src\app\features\dashboard\pages\Transfers\transfer-between-repositry\add-transfer-between-repositry` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-transfer-between-repositry.html` | 13.4 KB | قالب المكوّن |
| `add-transfer-between-repositry.scss` | 0 B | أنماط المكوّن |
| `add-transfer-between-repositry.spec.ts` | 677 B | اختبار وحدة (Vitest) |
| `add-transfer-between-repositry.ts` | 2.1 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\Transfers\transfer-between-repositry\explorer-transfer-between-repositry

### `src\app\features\dashboard\pages\Transfers\transfer-between-repositry\explorer-transfer-between-repositry` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-transfer-between-repositry.html` | 6.6 KB | قالب المكوّن |
| `explorer-transfer-between-repositry.scss` | 0 B | أنماط المكوّن |
| `explorer-transfer-between-repositry.spec.ts` | 712 B | اختبار وحدة (Vitest) |
| `explorer-transfer-between-repositry.ts` | 1.5 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions

### `src\app\features\dashboard\pages\users-and-permissions` (5 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `users-and-permissions.html` | 31 B | قالب المكوّن |
| `users-and-permissions.route.ts` | 1.6 KB | تعريف مسارات Angular |
| `users-and-permissions.scss` | 0 B | أنماط المكوّن |
| `users-and-permissions.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `users-and-permissions.ts` | 303 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\permissions

### `src\app\features\dashboard\pages\users-and-permissions\permissions` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `permissions.html` | 8.7 KB | قالب المكوّن |
| `permissions.scss` | 344 B | أنماط المكوّن |
| `permissions.spec.ts` | 562 B | اختبار وحدة (Vitest) |
| `permissions.ts` | 2.2 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\users

### `src\app\features\dashboard\pages\users-and-permissions\users` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `users.html` | 32 B | قالب المكوّن |
| `users.scss` | 0 B | أنماط المكوّن |
| `users.spec.ts` | 520 B | اختبار وحدة (Vitest) |
| `users.ts` | 452 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\users\add-users

### `src\app\features\dashboard\pages\users-and-permissions\users\add-users` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-users.html` | 5.4 KB | قالب المكوّن |
| `add-users.scss` | 0 B | أنماط المكوّن |
| `add-users.spec.ts` | 542 B | اختبار وحدة (Vitest) |
| `add-users.ts` | 389 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\users\explorer-users

### `src\app\features\dashboard\pages\users-and-permissions\users\explorer-users` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-users.html` | 3.1 KB | قالب المكوّن |
| `explorer-users.scss` | 0 B | أنماط المكوّن |
| `explorer-users.spec.ts` | 577 B | اختبار وحدة (Vitest) |
| `explorer-users.ts` | 1.7 KB | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\users-and-permissions

### `src\app\features\dashboard\pages\users-and-permissions\users-and-permissions` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `users-and-permissions.html` | 31 B | قالب المكوّن |
| `users-and-permissions.scss` | 0 B | أنماط المكوّن |
| `users-and-permissions.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `users-and-permissions.ts` | 303 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\users-and-permissions\add-users-and-permissions

### `src\app\features\dashboard\pages\users-and-permissions\users-and-permissions\add-users-and-permissions` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `add-users-and-permissions.html` | 3.5 KB | قالب المكوّن |
| `add-users-and-permissions.scss` | 0 B | أنماط المكوّن |
| `add-users-and-permissions.spec.ts` | 642 B | اختبار وحدة (Vitest) |
| `add-users-and-permissions.ts` | 390 B | ملف TypeScript |

## 📁 src\app\features\dashboard\pages\users-and-permissions\users-and-permissions\explorer-users-and-permissions

### `src\app\features\dashboard\pages\users-and-permissions\users-and-permissions\explorer-users-and-permissions` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `explorer-users-and-permissions.html` | 2.6 KB | قالب المكوّن |
| `explorer-users-and-permissions.scss` | 0 B | أنماط المكوّن |
| `explorer-users-and-permissions.spec.ts` | 677 B | اختبار وحدة (Vitest) |
| `explorer-users-and-permissions.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\layouts\auth-layout

### `src\app\layouts\auth-layout` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `auth-layout.html` | 126 B | قالب المكوّن |
| `auth-layout.scss` | 0 B | أنماط المكوّن |
| `auth-layout.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `auth-layout.ts` | 264 B | ملف TypeScript |

## 📁 src\app\layouts\main-layout

### `src\app\layouts\main-layout` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `main-layout.html` | 801 B | قالب المكوّن |
| `main-layout.scss` | 342 B | أنماط المكوّن |
| `main-layout.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `main-layout.ts` | 683 B | ملف TypeScript |

## 📁 src\app\shared

### `src\app\shared` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `shared-imports.ts` | 126 B | ملف TypeScript |

## 📁 src\app\shared\base

### `src\app\shared\base` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `destroy-base-component.ts` | 377 B | ملف TypeScript |
| `form-component-base.ts` | 2.0 KB | ملف TypeScript |
| `LookupFacade.ts` | 2.3 KB | ملف TypeScript |
| `README.md` | 38 B | ملف TypeScript |

## 📁 src\app\shared\components\header

### `src\app\shared\components\header` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `header.html` | 7.5 KB | قالب المكوّن |
| `header.scss` | 441 B | أنماط المكوّن |
| `header.spec.ts` | 527 B | اختبار وحدة (Vitest) |
| `header.ts` | 2.2 KB | ملف TypeScript |

## 📁 src\app\shared\components\pdf-printer

### `src\app\shared\components\pdf-printer` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `pdf-printer.html` | 26 B | قالب المكوّن |
| `pdf-printer.scss` | 0 B | أنماط المكوّن |
| `pdf-printer.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `pdf-printer.ts` | 12.0 KB | ملف TypeScript |

## 📁 src\app\shared\components\sidebar

### `src\app\shared\components\sidebar` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `sidebar.html` | 3.2 KB | قالب المكوّن |
| `sidebar.scss` | 2.3 KB | أنماط المكوّن |
| `sidebar.spec.ts` | 534 B | اختبار وحدة (Vitest) |
| `sidebar.ts` | 87.0 KB | ملف TypeScript |

## 📁 src\app\shared\config

### `src\app\shared\config` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `button-cofig.ts` | 194 B | ملف TypeScript |
| `search-config.ts` | 301 B | ملف TypeScript |

## 📁 src\app\shared\directives

### `src\app\shared\directives` (3 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `only-number.ts` | 1.2 KB | ملف TypeScript |
| `only-string.ts` | 1.7 KB | ملف TypeScript |
| `percentage-max.ts` | 1.3 KB | ملف TypeScript |

## 📁 src\app\shared\Enums

### `src\app\shared\Enums` (6 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `customer-type.enum.ts` | 66 B | ملف TypeScript |
| `custSupp-type.enum.ts` | 87 B | ملف TypeScript |
| `delegate-commetion-type.ts` | 152 B | ملف TypeScript |
| `enumSearch.ts` | 416 B | ملف TypeScript |
| `invoice.enum.ts` | 328 B | ملف TypeScript |
| `product-type.enum.ts` | 67 B | ملف TypeScript |

## 📁 src\app\shared\services

### `src\app\shared\services` (6 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `active-filter-key.spec.ts` | 368 B | اختبار وحدة (Vitest) |
| `active-filter-key.ts` | 397 B | ملف TypeScript |
| `basehttp-service.spec.ts` | 367 B | اختبار وحدة (Vitest) |
| `basehttp-service.ts` | 2.8 KB | خدمة API / منطق أعمال |
| `shared-state-services.spec.ts` | 388 B | اختبار وحدة (Vitest) |
| `shared-state-services.ts` | 923 B | خدمة API / منطق أعمال |

## 📁 src\app\shared\services\calculations

### `src\app\shared\services\calculations` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `totals.spec.ts` | 321 B | اختبار وحدة (Vitest) |
| `totals.ts` | 315 B | ملف TypeScript |

## 📁 src\app\shared\ui\attachment-manager

### `src\app\shared\ui\attachment-manager` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `attachment-manager.html` | 2.0 KB | قالب المكوّن |
| `attachment-manager.scss` | 81 B | أنماط المكوّن |
| `attachment-manager.spec.ts` | 605 B | اختبار وحدة (Vitest) |
| `attachment-manager.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\shared\ui\attachment-manager\models

### `src\app\shared\ui\attachment-manager\models` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `Attachment.ts` | 144 B | ملف TypeScript |

## 📁 src\app\shared\ui\form-error

### `src\app\shared\ui\form-error` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `form-error.html` | 230 B | قالب المكوّن |
| `form-error.scss` | 0 B | أنماط المكوّن |
| `form-error.spec.ts` | 549 B | اختبار وحدة (Vitest) |
| `form-error.ts` | 367 B | ملف TypeScript |

## 📁 src\app\shared\ui\generate-pdf

### `src\app\shared\ui\generate-pdf` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `generate-pdf.html` | 276 B | قالب المكوّن |
| `generate-pdf.scss` | 0 B | أنماط المكوّن |
| `generate-pdf.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `generate-pdf.ts` | 1.8 KB | ملف TypeScript |

## 📁 src\app\shared\ui\input-attachment

### `src\app\shared\ui\input-attachment` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `input-attachment.html` | 3.9 KB | قالب المكوّن |
| `input-attachment.scss` | 0 B | أنماط المكوّن |
| `input-attachment.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `input-attachment.ts` | 1.9 KB | ملف TypeScript |

## 📁 src\app\shared\ui\loading

### `src\app\shared\ui\loading` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `loading.html` | 1.3 KB | قالب المكوّن |
| `loading.scss` | 1.6 KB | أنماط المكوّن |
| `loading.spec.ts` | 534 B | اختبار وحدة (Vitest) |
| `loading.ts` | 189 B | ملف TypeScript |

## 📁 src\app\shared\ui\loading\services

### `src\app\shared\ui\loading\services` (1 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `loading.ts` | 400 B | ملف TypeScript |

## 📁 src\app\shared\ui\page-header

### `src\app\shared\ui\page-header` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `page-header.html` | 764 B | قالب المكوّن |
| `page-header.scss` | 0 B | أنماط المكوّن |
| `page-header.spec.ts` | 556 B | اختبار وحدة (Vitest) |
| `page-header.ts` | 634 B | ملف TypeScript |

## 📁 src\app\shared\ui\page-header-search

### `src\app\shared\ui\page-header-search` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `page-header-search.html` | 14.8 KB | قالب المكوّن |
| `page-header-search.scss` | 229 B | أنماط المكوّن |
| `page-header-search.spec.ts` | 599 B | اختبار وحدة (Vitest) |
| `page-header-search.ts` | 4.9 KB | ملف TypeScript |

## 📁 src\app\shared\ui\shared-confirm-dialog

### `src\app\shared\ui\shared-confirm-dialog` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `shared-confirm-dialog.html` | 1.6 KB | قالب المكوّن |
| `shared-confirm-dialog.scss` | 0 B | أنماط المكوّن |
| `shared-confirm-dialog.spec.ts` | 620 B | اختبار وحدة (Vitest) |
| `shared-confirm-dialog.ts` | 535 B | ملف TypeScript |

## 📁 src\app\shared\ui\toastr

### `src\app\shared\ui\toastr` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `toastr.html` | 173 B | قالب المكوّن |
| `toastr.scss` | 1.2 KB | أنماط المكوّن |
| `toastr.spec.ts` | 527 B | اختبار وحدة (Vitest) |
| `toastr.ts` | 295 B | ملف TypeScript |

## 📁 src\app\shared\ui\toastr\services

### `src\app\shared\ui\toastr\services` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `toastr.spec.ts` | 321 B | اختبار وحدة (Vitest) |
| `toastr.ts` | 451 B | ملف TypeScript |

## 📁 src\app\shared\ui\tree-node

### `src\app\shared\ui\tree-node` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `tree-node.html` | 2.9 KB | قالب المكوّن |
| `tree-node.scss` | 444 B | أنماط المكوّن |
| `tree-node.spec.ts` | 542 B | اختبار وحدة (Vitest) |
| `tree-node.ts` | 486 B | ملف TypeScript |

## 📁 src\app\shared\ui\tree-permissions

### `src\app\shared\ui\tree-permissions` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `tree-permissions.html` | 1.7 KB | قالب المكوّن |
| `tree-permissions.scss` | 857 B | أنماط المكوّن |
| `tree-permissions.spec.ts` | 591 B | اختبار وحدة (Vitest) |
| `tree-permissions.ts` | 413 B | ملف TypeScript |

## 📁 src\app\shared\ui\tree-project

### `src\app\shared\ui\tree-project` (4 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `tree-project.html` | 1.7 KB | قالب المكوّن |
| `tree-project.scss` | 1.6 KB | أنماط المكوّن |
| `tree-project.spec.ts` | 563 B | اختبار وحدة (Vitest) |
| `tree-project.ts` | 493 B | ملف TypeScript |

## 📁 src\app\shared\validations

### `src\app\shared\validations` (9 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `address.ts` | 573 B | ملف TypeScript |
| `email.ts` | 303 B | ملف TypeScript |
| `entity-name-validator.ts` | 505 B | ملف TypeScript |
| `noLeadingSpace.ts` | 308 B | ملف TypeScript |
| `phoneNumber.ts` | 1.1 KB | ملف TypeScript |
| `user-name.ts` | 571 B | ملف TypeScript |
| `usernameOrEmailValidators.ts` | 490 B | ملف TypeScript |
| `validation-helper.ts` | 555 B | ملف TypeScript |
| `validation-messages.ts` | 635 B | ملف TypeScript |

## 📁 src\environments

### `src\environments` (2 ملف)

| الملف | الحجم | الوصف |
|-------|------:|-------|
| `environment.development.ts` | 101 B | إعدادات البيئة |
| `environment.ts` | 101 B | إعدادات البيئة |

