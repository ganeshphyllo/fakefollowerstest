console.log("workin66 faketest ..!!!");

let profilePrefix = `profile-data`;
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
  medianER: `[${profilePrefix}=median-er]`,
  highLowThan: `[${profilePrefix}=higher-lower]`,
  fakeFollowers: `[${profilePrefix}=fakeFollowers]`,
  followers: `[${profilePrefix}=followers]`,
  avgLikes: `[${profilePrefix}=avg-likes]`,
  avgComments: `[${profilePrefix}=avg-comments]`,
  realFollowers: `[${profilePrefix}=real-followers]`,
  influencersFollowers: `[${profilePrefix}=influencers-followers]`,
  suspiciousFollowers: `[${profilePrefix}=suspicious-followers]`,
  massFollowers: `[${profilePrefix}=mass-followers]`,

  SampleHeader: `[${profilePrefix}=sample-header]`,

  AutocompleteLoader: `[input-data=loader-dots]`,
  ButtonLoader: `[input-data=btn-loader]`,
  MainLoader: `[input-data=main-loader]`,
  HeroWrapper: `[input-data=hero-wrapper]`,
  NoSponsoredContent: `[input-data=no-sponsored-content]`,
  NoProfileData: `[input-data=no-profile-data]`,
  MainHeroSection: `[input-data=main-hero-section]`,
  HeaderUsername: `[profile-data=header-username]`,
  placeholderTitle: "[profile-data=placeholder-title]",
  mainSpinner: `[profile-data=main-spinner]`,
};

// ----- Stripe integration -----
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_3cI3cvbrE9vWdmJaN85AQ00";

const isReturningFromStripe = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('payment_success') === 'true' || !!sessionStorage.getItem('pendingUsername');
}

const cleanReturnUrl = (username) => {
  const newUrl = `${window.location.pathname}?profile=${encodeURIComponent(username)}`;
  window.history.replaceState(null, null, newUrl);
}

let HeadingColor = "#13144d";
let TextColorWhite = "#ffffff";
let UsernameColor = "#121b2e";
let HeaderTitle = `Here's what our report looks like for`;

const searchInput = document.querySelector("[input-data=query]");
const submitButton = document.querySelector("[input-btn=check-profile]");
const autocompleteLoaderEle = document.querySelector(Selectors.AutocompleteLoader);
const buttonLoaderEle = document.querySelector(Selectors.ButtonLoader);
const SampleHeaderEle = document.querySelector(Selectors.SampleHeader);
const HeroAreaEle = document.querySelector(Selectors.HeroWrapper);
const copyLinkEle = document.querySelector(Selectors.profileCopyLink);
const MainHeroSectionEle = document.querySelector(Selectors.MainHeroSection);
const NoProfileDateEle = document.querySelector(Selectors.NoProfileData);
const NoSponsoredContentEle = document.querySelector(Selectors.NoSponsoredContent);
const SampleHeaderUsernameEle = document.querySelector(Selectors.HeaderUsername);

const fakeFollowersEle = document.querySelector(Selectors.fakeFollowers);
const placeholderTitleEle = document.querySelector(Selectors.placeholderTitle);
const mainSpinnerEle = document.querySelector(Selectors.mainSpinner);

const resultList = document.querySelector("[data=result-list]");
const listItem = document.querySelector("[data=list-item]");
const listItemImgAttr = "[data=item-image]";
const listItemNameAttr = "[data=list-item-name]";
const listItemUsernameAttr = "[data=list-item-username]";
const listItemIsVerifiedAttr = "[data=item-is-verified]";

const errorPopupEle = document.querySelector("[limit-error-popup]");

let captchaToken;
const uuid = crypto.randomUUID();

turnstile.ready(function () {
  turnstile.render("#captcha-container", {
    sitekey: "0x4AAAAAAA9TbmzOYr163QHk",
    callback: function (token) {
      console.log(`Challenge Success ${token}`);
      captchaToken = token;
      const url = new URL(window.location.href);
      const userhandle = url.searchParams.get("profile");

      updateAppState(userhandle, false);
      searchInput.value = userhandle;

      if (!userhandle) {
        updateAppState("emmachamberlain", false);
      }

      if (isReturningFromStripe()) {
        handlePostPayment();
      }
    },
  });
});

const Search_URL = "https://engagement-calculator.brand-fit.workers.dev/search?";

const fetchResults = debounce(async (req) => {
  const FinalUrl = new URL(Search_URL);
  FinalUrl.searchParams.set("q", req.query);
  FinalUrl.searchParams.set("p", req.platform || "it");
  FinalUrl.searchParams.set("sf", "ff");
  FinalUrl.searchParams.set("uu", uuid);
  FinalUrl.searchParams.set("tk", captchaToken);

  let response;
  try {
    response = await fetch(FinalUrl, {
      method: "GET",
    });
    if (response.status === 429) {
      response = await response.json();
      resultList.style.display = "none";
      errorPopupEle.style.display = "flex";
      return;
    }
    if (response.status === 200) {
      response = await response.json();
      req.onSuccess(response);
    }
    return response;
  } catch (err) {
    console.log("<< Error in fethcing >>", err);
  }
}, 500);

const fetchFakeDataInfo = async (req) => {
  const profileURL = new URL(`https://engagement-calculator.brand-fit.workers.dev/fake-data`);
  profileURL.searchParams.set("h", req.handle);
  profileURL.searchParams.set("uu", uuid);
  profileURL.searchParams.set("tk", captchaToken);

  let response;
  try {
    response = await fetch(profileURL);
    if (response.status === 200) {
      response = await response.json();
    } else {
      console.error("XXX Error in tiktok XXX", response);
      if (response.status === 429) {
        errorPopupEle.style.display = "flex";
        return;
      }
    }
  } catch (err) {
    console.error(err);
    return err;
  }
  return response;
};

let timeId = null;
let currentHandle;
let searchedProfile = {};
const handleTextChange = async (e) => {
  autocompleteLoaderEle.style.display = "block";
  const query = e.target.value;
  const query_input_value = searchInput.value;
  currentHandle = query;
  if (!query || !query.length) {
    autocompleteLoaderEle.style.display = "none";
    resultList.innerHTML = "";
    return;
  }
  fetchResults({
    query,
    onSuccess: (results) => {
      autocompleteLoaderEle.style.display = "none";
      if (query.length && results && results.data.length) {
        resultList.innerHTML = "";
        results.data.forEach((profile) => {
          const cloneListItem = listItem.cloneNode(true);
          const itemImg = cloneListItem.querySelector(listItemImgAttr);
          const itemFullName = cloneListItem.querySelector(listItemNameAttr);
          const itemUsername = cloneListItem.querySelector(listItemUsernameAttr);
          const itemVerified = cloneListItem.querySelector(listItemIsVerifiedAttr);

          itemImg.src = profile.picture;
          itemImg.alt = `${profile.fullname}'s image`;
          itemFullName.innerText = profile.fullname;
          itemUsername.innerText = `@${profile.username}`;
          if (!profile.is_verified) {
            itemVerified.style.display = "none";
          }
          cloneListItem.addEventListener("click", () => {
            searchInput.value = profile.username;
            currentHandle = profile.username;
            resultList.style.display = "none";
            updateBrowserUrl();
            handleUsernameSubmit();
          });

          resultList.appendChild(cloneListItem);
        });
        resultList.style.zIndex = 10;
        resultList.style.display = "flex";
      } else {
        resultList.innerHTML = `<div> No results found </div>`;
      }
    },
  });
};

const formatDateTime = (date = new Date()) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const updateGraphs = (graphsData) => {
  const { followerTypes, followers, likes } = graphsData;

  const followerTypesGraph = document.getElementById("followers-types");
  const followersGrowthGraph = document.getElementById("followers-growth");
  const likesGrowthGraph = document.getElementById("likes-growth");

  if (chart1 && chart2 && chart3) {
    chart1.destroy();
    chart2.destroy();
    chart3.destroy();
  }

  chart1 = renderDoughnutGraph({
    ref: followerTypesGraph,
    data: followerTypes,
  });
  chart2 = renderLineGraph({
    ref: followersGrowthGraph,
    yAxisData: followers.followersCount,
    xAxisData: followers.months,
    title: "Monthly trend of total followers",
  });
  chart3 = renderLineGraph({
    ref: likesGrowthGraph,
    yAxisData: likes.avgLikesCount,
    xAxisData: likes.months,
    title: "Monthly trend of average likes per post",
  });
};

const updateProfilePage = (results) => {
  NoProfileDateEle.style.display = "none";
  MainHeroSectionEle.style.display = "block";
  mainSpinnerEle.style.display = "none";
  const profilePicEle = document.querySelector(Selectors.profilePicture);
  const profileNameEle = document.querySelector(Selectors.fullname);
  const profileUsernameEle = document.querySelector(Selectors.username);

  if (results && Object.keys(results).length > 1) {
    const { profile, stats, followers, growth } = results;
    if (profile) {
      profilePicEle.src = profile.imageUrl;
      profileNameEle.innerText = profile.fullName;
      profileUsernameEle.innerText = profile.username;
      profilelinkEle.addEventListener("click", () =>
        window.open(profile.url, "blank")
      );
      copyLinkEle.addEventListener("click", () => {
        generateCopyUrl(
          currentHandle,
          () => {
            copyLinkEle.innerText = "Copied!";
            setTimeout(() => {
              copyLinkEle.innerText = "Copy profile link";
            }, 1500);
          },
          () => {
            copyLinkEle.innerText = "Failed to Copy!";
          }
        );
      });
    }

    if (stats) {
      fakeFollowersEle.innerText = `${stats.fakeFollowersRate}%` || "";
      followersEle.innerText = stats.followers || "";
      avgLikesEle.innerText = stats.averageLikes || "";
    }

    if (growth) {
      let graphData = {
        followerTypes: Object.values(followers).map(parseFloat),
        followers: growth.followers,
        likes: growth.likes,
      };
      updateGraphs(graphData);
    }
  } else {
    SampleHeaderUsernameEle.style.color = UsernameColor;
    SampleHeaderUsernameEle.innerText = `@${currentHandle}`;
    MainHeroSectionEle.style.display = "none";
    NoProfileDateEle.style.display = "flex";
    mainSpinnerEle.style.display = "none";
  }
};

const handlePostPayment = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const pending = sessionStorage.getItem('pendingUsername');
    const paymentFlag = params.get('payment_success');
    const profileParam = params.get('profile');

    if (paymentFlag === 'true' || pending) {
      const handle = pending || profileParam || currentHandle;
      if (handle) {
        currentHandle = handle;
        cleanReturnUrl(currentHandle);
        sessionStorage.removeItem('pendingUsername');
        mainSpinnerEle.style.display = 'block';
        const results = await fetchFakeDataInfo({ handle: currentHandle });
        updateProfilePage(results);
        mainSpinnerEle.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Error in post payment handling', err);
  }
};

const handleUsernameSubmit = async (e) => {
  e?.preventDefault();
  submitButton.style.color = HeadingColor;
  buttonLoaderEle.style.display = "block";
  resultList.innerHTML = "";
  copyLinkEle.innerText = "Copy profile link";

  if (!currentHandle || !currentHandle.length) {
    submitButton.style.color = TextColorWhite;
    buttonLoaderEle.style.display = "none";
    return;
  }

  sessionStorage.setItem('pendingUsername', currentHandle);
  const clientRef = encodeURIComponent(currentHandle);
  window.location.href = `${STRIPE_PAYMENT_LINK}?client_reference_id=${clientRef}`;
};

const generateCopyUrl = (query, onSuccess, onFailure) => {
  const shareUrl = new URL(`${window.location.href}`);
  shareUrl.searchParams.set("profile", query);
  function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(
      () => {
        console.log("Copied");
        onSuccess();
      },
      () => {
        onFailure();
      }
    );
  }
  updateClipboard(shareUrl);
};

const updateBrowserUrl = () => {
  if (!currentHandle || !currentHandle.length) return;
  const shareUrl = new URL(`${window.location.href}`);
  if (currentHandle !== "") {
    shareUrl.searchParams.set("profile", currentHandle);
  }
  window.history.pushState(null, null, `?profile=${currentHandle}`);
};

const updateAppState = (username, autoSubmit = false) => {
  currentHandle = username;
  if (searchInput) searchInput.value = username || "";
  if (autoSubmit) {
    handleUsernameSubmit();
  }
};

searchInput.addEventListener("input", handleTextChange);
submitButton.addEventListener("click", handleUsernameSubmit);
HeroAreaEle.addEventListener("click", (e) => {
  if (resultList.hasChildNodes) {
    resultList.style.display = "none";
  }
});
window.addEventListener("load", (ev) => {
  handlePostPayment();
});

function debounce(cb, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      return cb(...args);
    }, delay);
  };
}
function renderDoughnutGraph(graphData) {
  return new window.Chart(graphData.ref, {
    type: "doughnut",
    data: {
      labels: ["Real", "Influencers", "Suspicious", "Mass followers"],
      datasets: [
        {
          data: graphData.data,
          backgroundColor: ["#00C65F", "#680DE4", "#D91D4A", "#B3F001"],
          hoverOffset: 4,
          spacing: 5,
          borderRadius: 10,
          rotation: 180,
        },
      ],
    },
    options: {
      cutout: 160,
      plugins: {
        tooltip: {
          enabled: true,
          displayColors: false,
        },

        legend: { display: false },
        responsive: true,
      },
      scales: {
        y: {
          display: false,
        },
        x: {
          display: false,
        },
      },
      animation: false,
    },
  });
}
function renderLineGraph(graphData) {
  const formattedMonths = graphData.xAxisData.map((date) => {
    const dateObj = new Date(`${date}-01`);
    const formatedDate = formatDate(dateObj);
    const [day, month, year] = formatedDate.split("-");
    return `${month} '${year}`;
  });

  return new window.Chart(graphData.ref, {
    type: "line",
    data: {
      labels: formattedMonths,
      datasets: [
        {
          data: graphData.yAxisData,
          backgroundColor: "#fffff",
          borderWidth: 2,
          borderColor: "#680DE4",
          pointRadius: 2,
          pointBorderColor: "#680DE4",
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: graphData.title,
        position: "top",
        font: {
          weight: 700,
          size: 14,
        },
      },
      plugins: {
        tooltip: {
          enabled: true,
          displayColors: false,
          callbacks: {
            title: function (tooltipItem) {
              return "";
            },
          },
        },

        legend: { display: false },
        responsive: true,
      },
      scales: {
        y: {
          border: {
            dash: [5, 5],
          },
          ticks: {
            color: "#333",
            font: {
              weight: 700,
            },
            callback: function (value, index, values) {
              return largeNumberFormatter(value);
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              weight: 700,
            },
          },
        },
      },
      animation: false,
    },
  });
}
const largeNumberFormatter = (value) => {
  if (!value) return;
  let formatter = Intl.NumberFormat("en", { notation: "compact" });
  let formattedValue = formatter.format(value);
  return formattedValue;
};
