import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';
import { Toast } from '../components/toast.js';

export async function render(container) {
  const notes = await DB.getAll('notes');
  notes.sort((a,b) => b.timestamp - a.timestamp);
  
  const pinned = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);
  const sortedNotes = [...pinned, ...unpinned];
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          ${getIcon('fileText', 24)} Notes
        </h1>
        <button id="add-note-btn" class="bg-blue text-white w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
          ${getIcon('plus', 20)}
        </button>
      </div>
      
      <div class="relative mb-6">
        <span class="absolute left-3 top-3 text-muted">${getIcon('search', 16)}</span>
        <input type="text" id="note-search" placeholder="Search notes..." class="pl-10" />
      </div>
      
      ${sortedNotes.length === 0 ? `
        <div class="empty-state card border-dashed">
          ${getIcon('fileText', 48)}
          <h2 class="text-lg font-bold mb-2">No Notes Yet</h2>
          <p class="text-sm text-muted mb-4">Jot down workout ideas, meal recipes, or personal reflections.</p>
        </div>
      ` : `
        <div id="notes-list" class="flex flex-col gap-3">
          ${renderNotesList(sortedNotes)}
        </div>
      `}
    </div>
  `;

  // Search
  container.querySelector('#note-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = sortedNotes.filter(n => 
      (n.title && n.title.toLowerCase().includes(q)) || 
      (n.body && n.body.toLowerCase().includes(q)) ||
      (n.tag && n.tag.toLowerCase().includes(q))
    );
    const list = container.querySelector('#notes-list');
    if (list) list.innerHTML = renderNotesList(filtered);
    bindNoteEvents(container);
  });

  function renderNotesList(list) {
    if (list.length === 0) return '<div class="text-center text-muted py-4">No matching notes.</div>';
    return list.map(n => `
      <div class="card p-4 relative overflow-hidden transition-all hover-elevate note-item cursor-pointer" data-id="${n.id}">
        ${n.pinned ? `<div class="absolute top-0 right-0 w-8 h-8 bg-warning flex justify-end items-start p-1" style="clip-path: polygon(100% 0, 0 0, 100% 100%);"></div>` : ''}
        <div class="flex justify-between items-start mb-2 pr-4">
          <h3 class="font-bold text-lg leading-tight truncate">${n.title || 'Untitled'}</h3>
        </div>
        <p class="text-sm text-secondary mb-3 line-clamp-2">${n.body || ''}</p>
        <div class="flex justify-between items-center text-xs">
          ${n.tag ? `<span class="bg-card border border-glass-border px-2 py-0.5 rounded text-muted">${n.tag}</span>` : '<span></span>'}
          <span class="text-muted">${new Date(n.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');
  }
  
  function bindNoteEvents(cont) {
    cont.querySelectorAll('.note-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const note = sortedNotes.find(n => n.id === id);
        openNoteModal(note, cont);
      });
    });
  }
  
  bindNoteEvents(container);

  container.querySelector('#add-note-btn').addEventListener('click', () => {
    openNoteModal(null, container);
  });
}

function openNoteModal(note, container) {
  const isEdit = !!note;
  
  Modal.open(isEdit ? 'Edit Note' : 'New Note', `
    <form id="note-form" class="flex flex-col gap-4">
      <input type="text" id="n-title" placeholder="Title" value="${note?.title || ''}" class="text-xl font-bold bg-transparent border-none p-0 focus:ring-0" />
      <hr class="border-glass-border" />
      <textarea id="n-body" placeholder="Start typing..." class="bg-transparent border-none p-0 min-h-[150px] resize-none focus:ring-0" required>${note?.body || ''}</textarea>
      
      <div class="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label class="form-label text-xs">Tag</label>
          <select id="n-tag" class="text-sm py-1">
            <option value="">None</option>
            <option value="Gym" ${note?.tag === 'Gym' ? 'selected' : ''}>Gym</option>
            <option value="Diet" ${note?.tag === 'Diet' ? 'selected' : ''}>Diet</option>
            <option value="Journal" ${note?.tag === 'Journal' ? 'selected' : ''}>Journal</option>
            <option value="Goals" ${note?.tag === 'Goals' ? 'selected' : ''}>Goals</option>
          </select>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <input type="checkbox" id="n-pinned" class="w-4 h-4 accent-warning" ${note?.pinned ? 'checked' : ''} />
          <label for="n-pinned" class="text-sm font-semibold">Pin to top</label>
        </div>
      </div>
      
      <div class="flex gap-2 mt-4">
        ${isEdit ? `<button type="button" id="delete-note" class="btn btn-danger flex-1">${getIcon('trash', 18)}</button>` : ''}
        <button type="submit" class="btn btn-primary ${isEdit ? 'flex-[3]' : 'w-full'}">Save</button>
      </div>
    </form>
  `);

  if (isEdit) {
    document.getElementById('delete-note').addEventListener('click', async () => {
      if (confirm('Delete this note?')) {
        await DB.delete('notes', note.id);
        Modal.close();
        Toast.show('Note deleted');
        render(container);
      }
    });
  }

  document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newNote = {
      id: isEdit ? note.id : 'n_' + Date.now(),
      title: document.getElementById('n-title').value,
      body: document.getElementById('n-body').value,
      tag: document.getElementById('n-tag').value,
      pinned: document.getElementById('n-pinned').checked,
      timestamp: isEdit ? note.timestamp : Date.now(),
      date: isEdit ? note.date : new Date().toISOString().split('T')[0]
    };
    
    await DB.put('notes', newNote);
    Modal.close();
    Toast.show('Note saved');
    render(container);
  });
}