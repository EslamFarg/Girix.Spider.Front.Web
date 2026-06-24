/** Backend enum: Restaurant.SharedKernel.Enum.MaintenanceActionType (integer 1–9 per Swagger). */
export type MaintenanceActionEnum =
  | 'catalog'
  | 'transactions'
  | 'customerCompanies'
  | 'customers'
  | 'rooms'
  | 'huts'
  | 'tables'
  | 'delivery'
  | 'initializeSystem';

export interface MaintenanceActionOption {
  /** Numeric MaintenanceActionType value sent to POST /v1/Maintenance/run-actions */
  id: number;
  enum: MaintenanceActionEnum;
  name: string;
  description: string;
  dependsOn?: MaintenanceActionEnum[];
  warning?: string;
}

/** Matches RunMaintenanceActionsRequestDto — actions are integer enum values; password is required. */
export interface IRunMaintenanceActionsRequest {
  actions: number[];
  confirm: true;
  password: string;
}

export function toMaintenanceActionIds(selected: Iterable<MaintenanceActionEnum>): number[] {
  const ids: number[] = [];
  for (const key of selected) {
    const option = MAINTENANCE_ACTION_OPTIONS.find((item) => item.enum === key);
    if (option) {
      ids.push(option.id);
    }
  }
  return ids;
}

export const MAINTENANCE_ACTION_OPTIONS: MaintenanceActionOption[] = [
  {
    id: 2,
    enum: 'transactions',
    name: 'تصفير الحركات',
    description:
      'تصفير المرتجعات والمبيعات وسندات القبض وسندات الصرف مع إفراغ الطاولات والغرف والأكواخ من أي عمليات حالية',
    warning:
      'تصفير الحركات يؤثر على العمليات الجارية المرتبطة بالطاولات والغرف والأكواخ. تأكد من اختيار الإجراءات المناسبة.',
  },
  {
    id: 1,
    enum: 'catalog',
    name: 'تصفير الأصناف',
    description: 'حذف أو إعادة تعيين بيانات الأصناف والوجبات والمجموعات داخل النظام',
    warning: 'تصفير الأصناف قد يحذف أو يعيد تعيين بيانات الأصناف والوجبات والمجموعات.',
  },
  {
    id: 8,
    enum: 'customers',
    name: 'تصفير العملاء',
    description: 'إعادة تعيين بيانات العملاء وأرصدة الحسابات الخاصة بهم',
  },
  {
    id: 6,
    enum: 'tables',
    name: 'تصفير الطاولات',
    description: 'إفراغ جميع الطاولات وإلغاء أي طلبات أو حجوزات مرتبطة بها',
    dependsOn: ['transactions'],
  },
  {
    id: 4,
    enum: 'rooms',
    name: 'تصفير الغرف',
    description: 'إعادة تعيين حالة الغرف وإلغاء أي حجوزات أو عمليات مرتبطة بها',
    dependsOn: ['transactions'],
  },
  {
    id: 5,
    enum: 'huts',
    name: 'تصفير الأكواخ',
    description: 'إعادة تعيين حالة الأكواخ وإلغاء أي بيانات أو حجوزات مرتبطة بها',
    dependsOn: ['transactions'],
  },
  {
    id: 7,
    enum: 'delivery',
    name: 'تصفير التوصيل',
    description: 'إعادة تعيين بيانات التوصيل وإلغاء أي بيانات أو حجوزات مرتبطة به',
  },
  {
    id: 3,
    enum: 'customerCompanies',
    name: 'تصفير الشركات',
    description: 'إعادة تعيين بيانات الشركات وأرصدة الحسابات الخاصة بهم',
  },
  {
    id: 9,
    enum: 'initializeSystem',
    name: 'تصفير تهيئة النظام',
    description: 'إعادة ضبط إعدادات النظام إلى القيم الافتراضية وحذف أي تخصيصات سابقة',
    warning:
      'تحذير شديد: تصفير تهيئة النظام يعيد ضبط إعدادات النظام إلى القيم الافتراضية ولا يمكن التراجع عنه.',
  },
];
