import type { Service } from '../types';

interface Props {
  service: Service;
  onClick: () => void;
}

export default function ServiceCard({ service, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-rosa-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
        {service.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-rosa-600 transition-colors">
        {service.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {service.description}
      </p>
      <span className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-rosa-50 text-rosa-600 group-hover:bg-rosa-500 group-hover:text-white transition-all">
        Encomendar →
      </span>
    </div>
  );
}
