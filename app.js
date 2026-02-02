const cards = [
  {
    id: "aurora-sentinel",
    title: "Aurora Sentinel",
    subtitle: "Northern Lights #4 (1978)",
    publisher: "Indie / Northern Lights Press",
    era: "Bronze Age",
    characterType: "Hero",
    cardType: "Trading card",
    rarity: "Rare variant",
    year: 1978,
    artist: "Lena Ortega",
    writer: "M. Hoshino",
    value: "$120-$180 (graded) ",
    theme: "Forgotten Guardians Week",
    fact:
      "The polar halo effect on her costume was painted with metallic ink that only appeared in issue #4, because the printer swapped to a different batch the following month.",
    image: "assets/card-aurora.svg",
    alt:
      "Illustrated comic card showing Aurora Sentinel framed by a glowing halo over a midnight sky.",
  },
  {
    id: "ironwood-knight",
    title: "Ironwood Knight",
    subtitle: "Verdant Order #12 (1986)",
    publisher: "Dark Horse",
    era: "Modern",
    characterType: "Hero",
    cardType: "Cover variant",
    rarity: "Ultra rare",
    year: 1986,
    artist: "Calvin Matsu",
    writer: "Dara Whitlock",
    value: "Auction highlight (last seen $2.1k)",
    theme: "Armor & Relics Week",
    fact:
      "The knight's shield insignia is a nod to an abandoned crossover event; only this variant cover preserves the unused logo.",
    image: "assets/card-ironwood.svg",
    alt:
      "Stylized card art of the Ironwood Knight with a glowing, forest-green sigil and metallic crest.",
  },
  {
    id: "nebula-archivist",
    title: "Nebula Archivist",
    subtitle: "Cosmic Registry #1 (1991)",
    publisher: "Image",
    era: "Modern",
    characterType: "Supporting cast",
    cardType: "Original art",
    rarity: "One-of-a-kind",
    year: 1991,
    artist: "Aisha Khan",
    writer: "R. L. Omura",
    value: "Museum archive only",
    theme: "Cosmic Curators Week",
    fact:
      "Her databanks list over 600 alternate Earths, but the panel that names them was cropped in later reprints, making this card the only full record.",
    image: "assets/card-nebula.svg",
    alt:
      "Cosmic card art featuring the Nebula Archivist, a glowing figure against a starburst sky.",
  },
];

const preferenceConfig = [
  {
    title: "Favorite publishers",
    key: "publishers",
    options: ["Marvel", "DC", "Image", "Dark Horse", "Indie", "Manga"],
  },
  {
    title: "Eras",
    key: "eras",
    options: ["Golden Age", "Silver Age", "Bronze Age", "Modern"],
  },
  {
    title: "Character types",
    key: "characterTypes",
    options: ["Heroes", "Villains", "Supporting cast", "Teams"],
  },
  {
    title: "Card types",
    key: "cardTypes",
    options: ["Trading cards", "Covers", "Original art", "Variants"],
  },
];

const cardImage = document.getElementById("cardImage");
const cardTitle = document.getElementById("cardTitle");
const cardSubtitle = document.getElementById("cardSubtitle");
const cardFact = document.getElementById("cardFact");
const cardMeta = document.getElementById("cardMeta");
const cardLinks = document.getElementById("cardLinks");
const cardDetails = document.getElementById("cardDetails");
const card = document.getElementById("card");
const flipButton = document.getElementById("flipButton");
const shareButton = document.getElementById("shareButton");
const textSizeButton = document.getElementById("textSizeButton");
const cardSkeleton = document.getElementById("cardSkeleton");
const ownButton = document.getElementById("ownButton");
const wishlistButton = document.getElementById("wishlistButton");
const collectionSummary = document.getElementById("collectionSummary");
const archiveSearch = document.getElementById("archiveSearch");
const archiveList = document.getElementById("archiveList");
const archiveFilters = document.getElementById("archiveFilters");
const preferences = document.getElementById("preferences");
const resetPreferences = document.getElementById("resetPreferences");
const streakCount = document.getElementById("streakCount");
const streakMilestone = document.getElementById("streakMilestone");

const storage = {
  get(key, fallback) {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const todayIndex = () => {
  const start = new Date("2024-01-01");
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.abs(days) % cards.length;
};

const getNextMilestone = (count) => {
  const milestones = [7, 30, 100, 365];
  return milestones.find((milestone) => milestone > count) ?? "Legend";
};

const updateStreak = () => {
  const today = new Date().toDateString();
  const streakData = storage.get("streak", { last: null, count: 0 });
  if (streakData.last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (streakData.last === yesterday.toDateString()) {
      streakData.count += 1;
    } else {
      streakData.count = 1;
    }
    streakData.last = today;
    storage.set("streak", streakData);
  }
  streakCount.textContent = `${streakData.count} day${streakData.count === 1 ? "" : "s"}`;
  const next = getNextMilestone(streakData.count);
  streakMilestone.textContent =
    next === "Legend" ? "Legend status unlocked" : `Next: ${next}-day reward`;
};

const buildMeta = (cardData) => {
  const items = [
    `Publisher: ${cardData.publisher}`,
    `Year: ${cardData.year}`,
    `Artist: ${cardData.artist}`,
    `Writer: ${cardData.writer}`,
    `Rarity: ${cardData.rarity}`,
    `Value: ${cardData.value}`,
  ];
  cardMeta.innerHTML = items
    .map((item) => `<span>${item}</span>`)
    .join("");
};

const buildLinks = (cardData) => {
  const related = cards.filter(
    (entry) =>
      entry.id !== cardData.id &&
      (entry.artist === cardData.artist || entry.title.includes(cardData.title.split(" ")[0]))
  );
  cardLinks.innerHTML = related
    .map(
      (entry) =>
        `<a href="#${entry.id}">See ${entry.title} (${entry.year})</a>`
    )
    .join("");
};

const buildDetails = (cardData) => {
  const details = [
    `Theme: ${cardData.theme}`,
    `Era: ${cardData.era}`,
    `Character type: ${cardData.characterType}`,
    `Card type: ${cardData.cardType}`,
  ];
  cardDetails.innerHTML = details
    .map((detail) => `<li>${detail}</li>`)
    .join("");
};

const updateCollectionButtons = (cardData) => {
  const collection = storage.get("collection", { owned: [], wishlist: [] });
  ownButton.classList.toggle("active", collection.owned.includes(cardData.id));
  wishlistButton.classList.toggle(
    "active",
    collection.wishlist.includes(cardData.id)
  );
};

const updateCollectionSummary = () => {
  const collection = storage.get("collection", { owned: [], wishlist: [] });
  collectionSummary.innerHTML = `
    <p><strong>${collection.owned.length}</strong> owned cards</p>
    <p><strong>${collection.wishlist.length}</strong> on wishlist</p>
  `;
};

const toggleCollection = (type, cardId) => {
  const collection = storage.get("collection", { owned: [], wishlist: [] });
  const list = collection[type];
  const index = list.indexOf(cardId);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(cardId);
  }
  storage.set("collection", collection);
  updateCollectionButtons(getCardOfDay());
  updateCollectionSummary();
};

const applyCard = (cardData) => {
  cardTitle.textContent = cardData.title;
  cardSubtitle.textContent = `${cardData.subtitle} • ${cardData.publisher}`;
  cardFact.textContent = cardData.fact;
  cardImage.src = cardData.image;
  cardImage.alt = cardData.alt;
  buildMeta(cardData);
  buildLinks(cardData);
  buildDetails(cardData);
  updateCollectionButtons(cardData);
  cardSkeleton.style.display = "grid";
  cardImage.onload = () => {
    cardSkeleton.style.display = "none";
  };
};

const getCardOfDay = () => cards[todayIndex()];

const preloadImages = () => {
  const nextIndex = (todayIndex() + 1) % cards.length;
  [cards[nextIndex], ...cards].forEach((cardData) => {
    const image = new Image();
    image.src = cardData.image;
  });
};

const buildPreferences = () => {
  const stored = storage.get("preferences", {});
  preferences.innerHTML = "";
  preferenceConfig.forEach((group) => {
    const section = document.createElement("div");
    section.className = "preference-group";
    const title = document.createElement("strong");
    title.textContent = group.title;
    section.appendChild(title);

    group.options.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = group.key;
      input.value = option;
      input.checked = stored[group.key]?.includes(option) ?? false;
      input.addEventListener("change", () => updatePreferences(group.key, option));
      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      section.appendChild(label);
    });

    preferences.appendChild(section);
  });
};

const updatePreferences = (groupKey, option) => {
  const stored = storage.get("preferences", {});
  const values = stored[groupKey] ?? [];
  const index = values.indexOf(option);
  if (index >= 0) {
    values.splice(index, 1);
  } else {
    values.push(option);
  }
  stored[groupKey] = values;
  storage.set("preferences", stored);
};

const resetAllPreferences = () => {
  storage.set("preferences", {});
  buildPreferences();
};

const filterArchive = () => {
  const query = archiveSearch.value.trim().toLowerCase();
  const activeFilters = Array.from(archiveFilters.querySelectorAll("button.active")).map(
    (button) => button.dataset.filter
  );

  const filtered = cards.filter((cardData) => {
    const matchesQuery =
      !query ||
      [
        cardData.title,
        cardData.publisher,
        cardData.artist,
        cardData.writer,
        cardData.year,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.includes(cardData.publisher) ||
      activeFilters.includes(cardData.era);

    return matchesQuery && matchesFilters;
  });

  archiveList.innerHTML = filtered
    .map(
      (cardData) => `
      <article class="archive-card" id="${cardData.id}">
        <h4 class="archive-card__title">${cardData.title}</h4>
        <p class="archive-card__meta">${cardData.subtitle}</p>
        <p class="archive-card__meta">${cardData.publisher} • ${cardData.year}</p>
        <p class="archive-card__meta">${cardData.rarity} • ${cardData.cardType}</p>
      </article>
    `
    )
    .join("");
};

const buildArchiveFilters = () => {
  const filters = Array.from(
    new Set(cards.flatMap((cardData) => [cardData.publisher, cardData.era]))
  );
  archiveFilters.innerHTML = "";
  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = "chip";
    button.textContent = filter;
    button.dataset.filter = filter;
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      filterArchive();
    });
    archiveFilters.appendChild(button);
  });
};

const toggleFlip = () => {
  card.classList.toggle("flipped");
  card.setAttribute("aria-pressed", card.classList.contains("flipped"));
  flipButton.textContent = card.classList.contains("flipped")
    ? "View artwork"
    : "Flip for trivia";
};

const setupSharing = (cardData) => {
  if (!navigator.share) {
    shareButton.textContent = "Copy summary";
  }
  shareButton.addEventListener("click", async () => {
    const summary = `${cardData.title} — ${cardData.fact}`;
    if (navigator.share) {
      await navigator.share({
        title: `Card of the Day: ${cardData.title}`,
        text: summary,
      });
    } else {
      await navigator.clipboard.writeText(summary);
      shareButton.textContent = "Copied!";
      setTimeout(() => {
        shareButton.textContent = "Copy summary";
      }, 2000);
    }
  });
};

const toggleTextSize = () => {
  document.body.classList.toggle("text-large");
};

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
};

const init = () => {
  const cardData = getCardOfDay();
  applyCard(cardData);
  updateStreak();
  preloadImages();
  buildPreferences();
  buildArchiveFilters();
  filterArchive();
  updateCollectionSummary();
  setupSharing(cardData);
  registerServiceWorker();

  card.addEventListener("click", toggleFlip);
  flipButton.addEventListener("click", toggleFlip);
  textSizeButton.addEventListener("click", toggleTextSize);
  ownButton.addEventListener("click", () => toggleCollection("owned", cardData.id));
  wishlistButton.addEventListener("click", () => toggleCollection("wishlist", cardData.id));
  archiveSearch.addEventListener("input", filterArchive);
  resetPreferences.addEventListener("click", resetAllPreferences);
};

init();
