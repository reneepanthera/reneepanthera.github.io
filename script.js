const tabs=document.querySelectorAll('.tab-button');
const panels=document.querySelectorAll('.tab-panel');

tabs.forEach(btn=>{
  btn.addEventListener('click',()=>{
    tabs.forEach(b=>b.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

lucide.createIcons();
