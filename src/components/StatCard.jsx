import {
    CalendarDays,
    FileText,
    Mail,
    Users,
    Stethoscope,
    ClipboardList,
  } from 'lucide-react';
  
  const iconMap = {
    calendar: CalendarDays,
    'document-text': FileText,
    mail: Mail,
    users: Users,
    stethoscope: Stethoscope,
    checklist: ClipboardList,
  };
  
  export default function StatCard({ title, value, icon, color }) {
    const Icon = iconMap[icon] || CalendarDays; // Fallback icon
  
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  }
  