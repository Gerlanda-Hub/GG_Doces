import { Star } from 'lucide-react';
import type { Testimonial } from '../types';

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= testimonial.rating ? 'fill-dourado-400 text-dourado-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
        "{testimonial.comment}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rosa-300 to-rosa-400 flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-gray-800">{testimonial.name}</span>
      </div>
    </div>
  );
}
