import "./style.css";
import { config } from "./config";
import { works, type Work } from "./works";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// ---------- ダークモード ----------
function setupTheme(): void {
  const btn = $<HTMLButtonElement>("theme-toggle");
  let saved: string | null = null;
  try {
    saved = localStorage.getItem("theme");
  } catch {}
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const apply = (dark: boolean) => {
    document.documentElement.classList.toggle("dark", dark);
    btn.textContent = dark ? "☀️" : "🌙";
  };
  apply(saved ? saved === "dark" : prefersDark);
  btn.addEventListener("click", () => {
    const dark = !document.documentElement.classList.contains("dark");
    apply(dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  });
}

// ---------- タイピングアニメーション ----------
function setupTyping(): void {
  const el = $("typing");
  let word = 0;
  let char = 0;
  let deleting = false;
  const tick = () => {
    const text = config.typingWords[word];
    char += deleting ? -1 : 1;
    el.textContent = text.slice(0, char);
    let wait = deleting ? 50 : 110;
    if (!deleting && char === text.length) {
      deleting = true;
      wait = 1600;
    } else if (deleting && char === 0) {
      deleting = false;
      word = (word + 1) % config.typingWords.length;
      wait = 400;
    }
    setTimeout(tick, wait);
  };
  tick();
}

// ---------- スクロールで表示 ----------
const observer = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    }
  },
  { threshold: 0.15 },
);
const observeReveal = (root: ParentNode = document) =>
  root.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));

// ---------- スキル ----------
function renderSkills(): void {
  $("skills").innerHTML = config.skills.map((s) => `<li>${escape(s)}</li>`).join("");
}

// ---------- 作品一覧(絞り込み+詳細モーダル) ----------
function renderWorks(filter: string): void {
  const list = filter === "すべて" ? works : works.filter((w) => w.category === filter);
  const grid = $("works-grid");
  if (list.length === 0) {
    grid.innerHTML = `<p class="muted">作品は準備中です。順次追加していきます。</p>`;
    return;
  }
  grid.innerHTML = list
    .map(
      (w) => `
      <button class="work-card reveal" data-index="${works.indexOf(w)}">
        <div class="work-thumb">${
          w.image ? `<img src="${import.meta.env.BASE_URL}${escape(w.image)}" alt="" loading="lazy" />` : `<span>${escape(w.category)}</span>`
        }</div>
        <div class="work-info">
          <span class="tag">${escape(w.category)}</span>
          <h3>${escape(w.title)}</h3>
          <p>${escape(w.summary)}</p>
        </div>
      </button>`,
    )
    .join("");
  observeReveal(grid);
}

function setupFilters(): void {
  const categories = ["すべて", ...new Set(works.map((w) => w.category))];
  const box = $("filters");
  box.hidden = works.length === 0; // 作品が0個のときは絞り込みボタンを隠す
  box.innerHTML = categories
    .map((c, i) => `<button class="filter${i === 0 ? " active" : ""}" data-cat="${escape(c)}">${escape(c)}</button>`)
    .join("");
  box.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".filter");
    if (!btn) return;
    box.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderWorks(btn.dataset.cat!);
  });
  renderWorks("すべて");
}

function setupModal(): void {
  const modal = $<HTMLDialogElement>("work-modal");
  $("works-grid").addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".work-card");
    if (!card) return;
    const w: Work = works[Number(card.dataset.index)];
    const links = [
      w.url && `<a class="btn" href="${escape(w.url)}" target="_blank" rel="noopener">サイトを見る</a>`,
      w.repo && `<a class="btn btn-outline" href="${escape(w.repo)}" target="_blank" rel="noopener">GitHub</a>`,
    ]
      .filter(Boolean)
      .join("");
    $("modal-body").innerHTML = `
      <span class="tag">${escape(w.category)} ・ ${w.year}</span>
      <h3>${escape(w.title)}</h3>
      <p>${escape(w.description)}</p>
      <ul class="skills">${w.tech.map((t) => `<li>${escape(t)}</li>`).join("")}</ul>
      <div class="modal-links">${links}</div>`;
    modal.showModal();
  });
  $("modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

// ---------- GitHub API ----------
interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
}

async function loadRepos(): Promise<void> {
  const grid = $("repo-grid");
  try {
    const res = await fetch(`https://api.github.com/users/${config.githubUser}/repos?sort=updated&per_page=12`);
    if (!res.ok) throw new Error(String(res.status));
    const repos = ((await res.json()) as Repo[]).filter((r) => !r.fork).slice(0, 6);
    if (repos.length === 0) {
      grid.innerHTML = `<p class="muted">公開リポジトリはまだありません。</p>`;
      return;
    }
    grid.innerHTML = repos
      .map(
        (r) => `
        <a class="repo-card reveal" href="${escape(r.html_url)}" target="_blank" rel="noopener">
          <h3>${escape(r.name)}</h3>
          <p>${escape(r.description ?? "説明なし")}</p>
          <div class="repo-meta">
            ${r.language ? `<span>● ${escape(r.language)}</span>` : ""}
            <span>★ ${r.stargazers_count}</span>
            <span>${new Date(r.updated_at).toLocaleDateString("ja-JP")}</span>
          </div>
        </a>`,
      )
      .join("");
    observeReveal(grid);
  } catch {
    grid.innerHTML = `<p class="muted">リポジトリを読み込めませんでした(src/config.ts の githubUser を確認してください)。</p>`;
  }
}

// ---------- お問い合わせ ----------
function setupContact(): void {
  const form = $<HTMLFormElement>("contact-form");
    if (!form) return; // フォームが無いときは何もしない
  const status = $("form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!config.formspreeId) {
      const body = `${data.get("message")}\n\n${data.get("name")} (${data.get("email")})`;
      location.href = `mailto:${config.fallbackEmail}?subject=${encodeURIComponent("ポートフォリオからのお問い合わせ")}&body=${encodeURIComponent(body)}`;
      return;
    }
    status.textContent = "送信中…";
    try {
      const res = await fetch(`https://formspree.io/f/${config.formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = "送信しました。ありがとうございます!";
    } catch {
      status.textContent = "送信に失敗しました。時間をおいてもう一度お試しください。";
    }
  });
}

setupTheme();
setupTyping();
renderSkills();

setupFilters();
setupModal();
loadRepos();
setupContact();
$("year").textContent = String(new Date().getFullYear());
observeReveal();
