"use strict";

console.log("working fake ..!!!");

/* ----------------------------------
   CONSTANTS & SELECTORS
----------------------------------- */

const profilePrefix = "profile-data";

const Selectors = {
  profilePicture: `[${profilePrefix}=profile-picture]`,
  fullname: `[${profilePrefix}=fullname]`,
  username: `[${profilePrefix}=username]`,
  profileLink: `[${profilePrefix}=profile-link]`,
  profileVerified: `[${profilePrefix}=is-verified]`,
  profileCopyLink: `[${profilePrefix}=copy-link]`,
  popupImage: `[${profilePrefix}=popup-image]`,
  popupUsername: `[${profilePrefix}=popup-username]`,
  engagementRate: `[${profilePrefix}=eng-rate]`,
  fakeFollowers: `[${profilePrefix}=fakeFollowers]`,
  followers: `[${profilePrefix}=followers]`,
  avgLikes: `[${profilePrefix}=avg-likes]`,
  realFollowers: `[${profilePrefix}=real-followers]`,
  influencersFollowers: `[${profilePrefix}=influencers-followers]`,
  suspiciousFollowers: `[${profilePrefix}=suspicious-followers]`,
  massFollowers: `[${profilePrefix}=mass-followers]`,

  SampleHeader: `[${profilePrefix}=sample-header]`,
  HeaderUsername: `[profile-data=header-username]`,
  placeholderTitle: `[profile-data=placeholder-title]`,
  mainSpinner: `[profile-data=main-spinner]`,

  AutocompleteLoader: `[input-data=loader-dots]`,
  ButtonLoader: `[input-data=btn-loader]`,
  MainLoader: `[input-data=main-loader]`,
  HeroWrapper: `[input-data=hero-wrapper]`,
  NoSponsoredContent: `[input-data=no-sponsored-content]`,
  NoProfileData: `[input-data=no-profile-data]`,
  MainHeroSection: `[input-data=main-hero-section]`,
};

/* ----------------------------------
   COLORS & TEXT
----------------------------------- */

const HeadingColor = "#13144d";
const TextColorWhite = "#ffffff";
const UsernameColor = "#121b2e";
const HeaderTitle = "Here's what our report looks like for";

/* ----------------------------------
   ELEMENTS
----------------------------------- */

const searchInput = document.querySelector("[input-data=query]");
const submitButton = document.querySelector("[input-btn=check-profile]");
const autocompleteLoaderEle = document.querySelector(Selectors.AutocompleteLoader);
const buttonLoaderEle = document.querySelector(Selectors.ButtonLoader);
const SampleHeaderEle = document.querySelector(Selectors.SampleHeader);
const HeroAreaEle = document.querySelector(Selectors.HeroWrapper);
const copyLinkEle = document.querySelector(Selectors.profileCopyLink);
const MainHeroSectionEle = document.querySelector(Selectors.MainHeroSection);
const NoProfileDateEle = document.querySelector(Selectors.NoProfileData);
const SampleHeaderUsernameEle = document.querySelector(Selectors.HeaderUsername);
const fakeFollowersEle = document.querySelector(Selectors.fakeFollowers);
const placeholderTitleEle = document.querySelector(Selectors.placeholderTitle);
const mainSpinnerEle = document.querySelector(Selectors.mainSpinner);

/* ----------------------------------
   AUTOCOMPLETE LIST
----------------------------------- */

const resultList = document.querySelector("[data=result-list]");
const listItem = document.querySelector("[data=list-item]");
const listItemImgAttr = "[data=item-image]";
const listItemNameAttr = "[data=list-item-name]";
const listItemUsernameAttr = "[data=list-item-username]";
const listItemIsVerifiedAttr = "[data=item-is-verified]";

/* ----------------------------------
   GLOBALS
----------------------------------- */

let captchaToken;
let currentHandle = "";
const uuid = crypto.randomUUID();

const SEARCH_URL =
  "https://engagement-calculator.brand-fit.workers.dev/search?";
const FAKE_DATA_URL =
  "https://engagement-calculator.brand-fit.workers.dev/fake-data";

/* ----------------------------------
   CAPTCHA
----------------------------------- */

turnstile.ready(() => {
  turnstile.render("#captcha-container", {
    sitekey: "0x4AAAAAAA9TbmzOYr163QHk",
    callback(token) {
      captchaToken = token;

      const url = new URL(window.location.href);
      const userhandle = url.searchParams.get("profile");

      if (userhandle) {
        searchInput.value = userhandle;
        updateAppState(userhandle);
      } else {
        updateAppState("emmachamberlain");
      }
    },
  });
});

/* ----------------------------------
   FETCH AUTOCOMPLETE
----------------------------------- */

const fetchResults = debounce(async (req) => {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", req.query);
  url.searchParams.set("p", "it");
  url.searchParams.set("sf", "ff");
  url.searchParams.set("uu", uuid);
  url.searchParams.set("tk", captchaToken);

  try {
    const res = await fetch(url);
    if (res.status === 200) {
      const json = await res.json();
      req.onSuccess(json);
    }
  } catch (err) {
    console.error(err);
  }
}, 500);

/* ----------------------------------
   FETCH PROFILE DATA
----------------------------------- */

async function fetchFakeDataInfo(handle) {
  const url = new URL(FAKE_DATA_URL);
  url.searchParams.set("h", handle);
  url.searchParams.set("uu", uuid);
  url.searchParams.set("tk", captchaToken);

  try {
    const res = await fetch(url);
    if (res.status === 200) {
      return await res.json();
    }
  } catch (err) {
    console.error(err);
  }
}

/* ----------------------------------
   INPUT HANDLER
----------------------------------- */

async function handleTextChange(e) {
  const query = e.target.value.trim();
  currentHandle = query;

  if (!query) {
    resultList.innerHTML = "";
    return;
  }

  autocompleteLoaderEle.style.display = "block";

  fetchResults({
    query,
    onSuccess(results) {
      autocompleteLoaderEle.style.display = "none";
      resultList.innerHTML = "";

      if (!results?.data?.length) return;

      results.data.forEach((profile) => {
        const item = listItem.cloneNode(true);

        item.querySelector(listItemImgAttr).src = profile.picture;
        item.querySelector(listItemNameAttr).innerText = profile.fullname;
        item.querySelector(listItemUsernameAttr).innerText =
          "@" + profile.username;

        if (!profile.is_verified) {
          item.querySelector(listItemIsVerifiedAttr).style.display = "none";
        }

        item.onclick = () => {
          searchInput.value = profile.username;
          currentHandle = profile.username;
          resultList.style.display = "none";
          updateBrowserUrl();
          handleUsernameSubmit();
        };

        resultList.appendChild(item);
      });

      resultList.style.display = "flex";
    },
  });
}

/* ----------------------------------
   SUBMIT HANDLER
----------------------------------- */

async function handleUsernameSubmit(e) {
  e?.preventDefault();

  if (!currentHandle) return;

  buttonLoaderEle.style.display = "block";

  const data = await fetchFakeDataInfo(currentHandle);

  buttonLoaderEle.style.display = "none";

  if (!data) {
    NoProfileDateEle.style.display = "flex";
    return;
  }

  updateProfilePage(data);
}

/* ----------------------------------
   PROFILE UI UPDATE
----------------------------------- */

function updateProfilePage(results) {
  MainHeroSectionEle.style.display = "block";
  NoProfileDateEle.style.display = "none";
  mainSpinnerEle.style.display = "none";

  const { profile, stats, followers } = results;

  if (profile) {
    document.querySelector(Selectors.profilePicture).src = profile.imageUrl;
    document.querySelector(Selectors.fullname).innerText = profile.fullName;
    document.querySelector(Selectors.username).innerText = profile.username;
  }

  if (stats) {
    document.querySelector(Selectors.engagementRate).innerText =
      stats.engagementRate + "%";
    fakeFollowersEle.innerText = stats.fakeFollowersRate + "%";
  }

  if (followers) {
    document.querySelector(Selectors.realFollowers).innerText =
      followers.real + "%";
    document.querySelector(Selectors.influencersFollowers).innerText =
      followers.influencers + "%";
    document.querySelector(Selectors.suspiciousFollowers).innerText =
      followers.suspicious + "%";
    document.querySelector(Selectors.massFollowers).innerText =
      followers.massFollowers + "%";
  }

  SampleHeaderEle.innerText = HeaderTitle;
  SampleHeaderUsernameEle.innerText = "@" + currentHandle;
}

/* ----------------------------------
   HELPERS
----------------------------------- */

function updateBrowserUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("profile", currentHandle);
  window.history.pushState({}, "", url);
}

function updateAppState(username) {
  currentHandle = username;
  handleUsernameSubmit();
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/* ----------------------------------
   EVENTS
----------------------------------- */

searchInput?.addEventListener("input", handleTextChange);
submitButton?.addEventListener("click", handleUsernameSubmit);
HeroAreaEle?.addEventListener("click", () => {
  resultList.style.display = "none";
});
