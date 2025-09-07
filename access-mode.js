/*! Lightweight role/view switcher — v1.0
 *  - Sets html[data-mode="editor"|"user"] based on localStorage or URL ?mode=...
 *  - Hides elements that should be editor-only
 *  - Locks contenteditable + data-lockable tools for regular users
 *  - Adds a small floating "EDITOR MODE" badge when active
 *  Usage:
 *    - Mark elements visible only to you with: class="only-editor" or data-editor-only
 *    - Mark elements visible only to users with: class="only-user"
 *    - Mark interactive tools you want disabled for users with: data-lockable
 *    - Switch modes:
 *        /mode.html  → buttons to toggle
 *        anypage.html?mode=editor&key=BananaTua23 → enter editor
 *        anypage.html?mode=user → leave editor
 */
(function(){
  try {
    var url = new URL(window.location.href);
    var qMode = url.searchParams.get('mode');
    var qKey  = url.searchParams.get('key');

    function setMode(mode) {
      document.documentElement.setAttribute('data-mode', mode === 'editor' ? 'editor' : 'user');
      try { localStorage.setItem('tsn_mode', mode === 'editor' ? 'editor' : 'user'); } catch(e) {}
    }

    var mode = (localStorage.getItem('tsn_mode') || 'user');
    if (qMode) {
      if (qMode === 'editor') {
        // OPTIONAL passphrase check; this is NOT secure on a static site.
        if (!qKey || qKey === 'BananaTua23') {
          mode = 'editor';
        }
      } else if (qMode === 'user') {
        mode = 'user';
      }
      setMode(mode);
    } else {
      setMode(mode);
    }

    var isEditor = (mode === 'editor');

    if (!isEditor) {
      // Remove/hide common editor/admin UI bits
      var hideSelectors = [
        '[data-editor-only]',
        '.editor-only',
        '.only-editor',
        '.edit-toolbar',
        '.edit-controls',
        '.admin-only',
        '[data-admin]',
        '.debug-panel',
        '.dev-only'
      ].join(',');
      document.querySelectorAll(hideSelectors).forEach(function(el){ el.remove(); });

      // Lock contenteditable zones
      document.querySelectorAll('[contenteditable="true"]').forEach(function(el){
        el.setAttribute('contenteditable', 'false');
        el.classList.remove('edit-outline');
        el.classList.remove('editable');
      });

      // Disable specifically tagged controls
      document.querySelectorAll('[data-lockable]').forEach(function(el){
        var tag = el.tagName.toLowerCase();
        if (tag === 'a') {
          el.addEventListener('click', function(e){ e.preventDefault(); }, { capture: true });
          el.setAttribute('aria-disabled', 'true');
          el.style.pointerEvents = 'none';
          el.style.opacity = '0.6';
        } else {
          try { el.disabled = true; } catch(e) {}
          el.setAttribute('aria-disabled', 'true');
          el.classList.add('opacity-60');
          el.classList.add('pointer-events-none');
        }
      });
    } else {
      // Add a subtle corner badge to remind you're in editor mode
      var badge = document.createElement('div');
      badge.textContent = 'EDITOR MODE';
      badge.style.position = 'fixed';
      badge.style.zIndex = '9999';
      badge.style.bottom = '16px';
      badge.style.right = '16px';
      badge.style.padding = '8px 12px';
      badge.style.background = 'rgba(31,74,255,0.9)';
      badge.style.color = '#fff';
      badge.style.font = '600 12px/1 Inter, system-ui, sans-serif';
      badge.style.borderRadius = '999px';
      badge.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      badge.style.letterSpacing = '0.4px';
      badge.style.userSelect = 'none';
      badge.style.pointerEvents = 'none';
      document.addEventListener('DOMContentLoaded', function(){
        document.body.appendChild(badge);
      });
    }
  } catch(err) {
    console.error('[access-mode] error:', err);
  }
})(); 
