import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Hash, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export interface CalendarPost {
  id: string;
  date: string;
  type: string;
  topic: string;
  caption: string;
  hashtags: string[];
  service: string;
}

const STORAGE_KEY = 'kavea_calendar_posts';
const TYPE_COLORS: Record<string, string> = {
  Reel: 'bg-kavea-rose text-white',
  'Post Estático': 'bg-kavea-dark text-white',
  Carrusel: 'bg-kavea-gold text-white',
  Historia: 'bg-purple-500 text-white',
  Post: 'bg-kavea-dark text-white',
};

const SPECIAL_DAYS: Record<string, string> = {
  '02-14': '💝 San Valentín',
  '03-19': '👨 Día del Padre',
  '05-05': '🌸 Día de la Madre',
  '06-21': '☀️ Inicio Verano',
  '12-25': '🎄 Navidad',
  '01-01': '🎆 Año Nuevo',
};

function getSpecialDay(date: Date): string | null {
  const key = format(date, 'MM-dd');
  return SPECIAL_DAYS[key] || null;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPosts(JSON.parse(stored));
    } catch {}
  }, []);

  const savePost = (post: CalendarPost) => {
    const updated = [...posts.filter((p) => p.id !== post.id), post];
    setPosts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const deletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setSelectedPost(null);
    toast.success('Post eliminado del calendario');
  };

  const getPostsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return posts.filter((p) => p.date === dateStr);
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();

  const monthlyPosts = posts.filter((p) => {
    const postDate = new Date(p.date);
    return isSameMonth(postDate, currentDate);
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kavea-dark mb-1">Calendario de Contenido</h1>
        <p className="text-kavea-muted text-sm">
          Planifica y organiza tus publicaciones. Los posts generados aparecen aquí automáticamente.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-kavea-dark">{monthlyPosts.length}</p>
          <p className="text-xs text-kavea-muted">Posts este mes</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-kavea-dark">
            {monthlyPosts.filter((p) => p.type === 'Reel').length}
          </p>
          <p className="text-xs text-kavea-muted">Reels</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-kavea-dark">
            {Math.round((monthlyPosts.length / 30) * 7) || 0}
          </p>
          <p className="text-xs text-kavea-muted">Posts/semana</p>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <button
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="p-2 rounded-lg hover:bg-gray-50 text-kavea-muted hover:text-kavea-dark transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-kavea-dark capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="p-2 rounded-lg hover:bg-gray-50 text-kavea-muted hover:text-kavea-dark transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {weekDays.map((w) => (
            <div key={w} className="py-2 text-center text-xs font-semibold text-kavea-muted">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const dayPosts = getPostsForDate(day);
            const specialDay = getSpecialDay(day);

            return (
              <div
                key={idx}
                className={`min-h-[72px] p-1.5 border-b border-r border-gray-50 ${
                  !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? 'bg-kavea-rose text-white'
                        : isCurrentMonth
                        ? 'text-kavea-dark'
                        : 'text-gray-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                {specialDay && isCurrentMonth && (
                  <p className="text-[9px] text-kavea-rose font-medium leading-tight mb-0.5 truncate">
                    {specialDay}
                  </p>
                )}
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] font-medium truncate ${
                        TYPE_COLORS[post.type] || 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {post.topic.slice(0, 20)}...
                    </button>
                  ))}
                  {dayPosts.length > 2 && (
                    <p className="text-[9px] text-kavea-muted pl-1">
                      +{dayPosts.length - 2} más
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly post list */}
      {monthlyPosts.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-kavea-dark mb-3">
            Posts de {format(currentDate, 'MMMM', { locale: es })} ({monthlyPosts.length})
          </h2>
          <div className="space-y-2">
            {monthlyPosts
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-kavea-rose-light transition-colors"
                >
                  <div className="text-sm font-bold text-kavea-dark w-8 text-center shrink-0">
                    {format(new Date(post.date), 'd')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className={`text-xs ${TYPE_COLORS[post.type] || 'bg-gray-200 text-gray-700'}`}>
                        {post.type}
                      </Badge>
                      <span className="text-xs text-kavea-muted">{post.service}</span>
                    </div>
                    <p className="text-xs text-kavea-dark truncate">{post.topic}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-kavea-muted">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm font-medium">No hay posts planificados este mes</p>
          <p className="text-xs mt-1">
            Genera contenido en el{' '}
            <a href="/generator" className="text-kavea-rose hover:underline">
              Generador
            </a>{' '}
            y guárdalos en el calendario.
          </p>
        </div>
      )}

      {/* Post detail dialog */}
      <Dialog open={Boolean(selectedPost)} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={`${TYPE_COLORS[selectedPost.type] || 'bg-gray-200 text-gray-700'} text-xs`}>
                    {selectedPost.type}
                  </Badge>
                  <span className="text-sm">{selectedPost.topic}</span>
                </DialogTitle>
                <DialogDescription>
                  Programado para el {format(new Date(selectedPost.date), "d 'de' MMMM", { locale: es })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide mb-2">Caption</p>
                  <p className="text-sm text-kavea-dark whitespace-pre-wrap bg-gray-50 rounded-xl p-3 leading-relaxed">
                    {selectedPost.caption}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPost.caption);
                      toast.success('Caption copiada');
                    }}
                    className="flex items-center gap-1 text-xs text-kavea-rose hover:text-kavea-rose/80 mt-2"
                  >
                    <Copy size={12} /> Copiar caption
                  </button>
                </div>
                {selectedPost.hashtags.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide flex items-center gap-1">
                        <Hash size={10} /> Hashtags
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedPost.hashtags.join(' '));
                          toast.success('Hashtags copiados');
                        }}
                        className="text-xs text-kavea-rose hover:text-kavea-rose/80"
                      >
                        Copiar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPost.hashtags.map((tag) => (
                        <span key={tag} className="text-xs bg-kavea-rose-pale text-kavea-rose px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => deletePost(selectedPost.id)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={12} /> Eliminar del calendario
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { type CalendarPost as CalendarPostType };
