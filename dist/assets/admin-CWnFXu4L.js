import{d as f,u as y,f as b}from"./orders-DQMCpm3D.js";const d="puffpop-admin-key",p=e=>`$${Number(e).toFixed(2)}`,g=document.getElementById("admin-login"),m=document.getElementById("admin-login-error"),h=document.getElementById("admin-password"),$=document.getElementById("admin-board"),u=document.getElementById("admin-list"),o=document.getElementById("admin-error");function n(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function w(e){const t=new Date(e);return Number.isNaN(t.getTime())?"":t.toLocaleString(void 0,{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}function E(e){m.hidden=!1,m.textContent=e}function v(e){if(!e.length){u.innerHTML='<p class="admin-empty">No orders yet.</p>';return}u.innerHTML=e.map(t=>{const a=t.status==="done",s=(t.items||[]).map(i=>`${i.qty} × ${n(i.packLabel)} · ${n(i.colorsLabel)}`).join("<br>");return`
        <article class="admin-card${a?" is-done":""}" data-id="${n(t.id)}">
          <header>
            <strong>${n(t.firstName)} ${n(t.lastName)}</strong>
            <span>${a?"Delivered":"New"}</span>
          </header>
          <p class="admin-meta">${n(w(t.createdAt))} · ${n(t.id)}</p>
          <p><a href="tel:${n(t.phone)}">${n(t.phone)}</a></p>
          <p>${n(t.address)}${t.apartment?`, ${n(t.apartment)}`:""}<br>${n(t.city)}</p>
          <p>${s}</p>
          <p class="admin-total">${p(t.total)} · ${t.shipping===0?"Free delivery":`Shipping ${p(t.shipping)}`} · Cash on delivery</p>
          <div class="admin-actions">
            <button type="button" class="btn btn-ghost" data-action="status">${a?"Mark as new":"Mark delivered"}</button>
            <button type="button" class="btn btn-ghost" data-action="delete">Delete</button>
          </div>
        </article>`}).join("")}async function r(e){o.hidden=!0;const t=await b(e);g.hidden=!0,$.hidden=!1,v(t)}g.addEventListener("submit",async e=>{e.preventDefault();const t=h.value;m.hidden=!0;try{await r(t),sessionStorage.setItem(d,t)}catch(a){E(a.message==="Sign in required."?"That password is not right.":a.message)}});document.getElementById("admin-refresh").addEventListener("click",async()=>{const e=sessionStorage.getItem(d);if(e)try{await r(e)}catch(t){o.hidden=!1,o.textContent=t.message}});u.addEventListener("click",async e=>{const t=e.target.closest("[data-action]");if(!t)return;const a=t.closest("[data-id]"),s=sessionStorage.getItem(d);if(!a||!s)return;const i=a.dataset.id;t.disabled=!0;try{if(t.dataset.action==="delete")await f(s,i);else{const c=a.classList.contains("is-done");await y(s,i,c?"new":"done")}await r(s)}catch(c){o.hidden=!1,o.textContent=c.message,t.disabled=!1}});const l=sessionStorage.getItem(d);l&&(h.value=l,r(l).catch(()=>{sessionStorage.removeItem(d)}));
