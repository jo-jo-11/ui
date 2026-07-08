"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // 頁面共用元素：先集中抓取 DOM，後面每個互動效果會依是否存在再啟用。
  const currentYear = new Date().getFullYear();
  const footerYear = document.querySelector(".footer-year");
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navBackdrop = document.querySelector(".nav-backdrop");
  const navLinks = document.querySelectorAll(".site-nav a:not(.nav-cta)");
  const snapSections = Array.from(document.querySelectorAll(".page-section"));
  const faqQuestions = document.querySelectorAll(".faq-question");
  const featureScrollSection = document.querySelector("[data-feature-scroll]");
  const ctaSection = document.querySelector(".cta-section");
  const videoButtons = document.querySelectorAll("[data-video-id]");
  const videoModal = document.querySelector("[data-video-modal]");
  const videoFrame = document.querySelector("[data-video-frame]");
  const videoCloseButtons = document.querySelectorAll("[data-video-close]");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isIndexPage = currentPage === "index.html";
  let lastScrollY = window.scrollY;

  // 頁尾年份：自動填入今年年份，避免每年手動改 footer 版權年份。
  if (footerYear) {
    footerYear.textContent = currentYear;
  }

  // 手機版區塊預熱：舊款手機在 sticky 區塊切換時較容易延遲重繪，提前標記下一個大型區塊並嘗試解碼圖片。
  const warmupMobileSections = () => {
    const mobileQuery = window.matchMedia("(max-width: 560px)");
    const warmupSections = document.querySelectorAll("#application-scenes, #solutions, #solutions-3, #success-stories, #apply-info");

    if (!warmupSections.length) {
      return;
    }

    const markSectionReady = (section) => {
      section.classList.add("is-section-ready");

      section.querySelectorAll("img").forEach((image) => {
        if (image.complete) {
          return;
        }

        image.decode?.().catch(() => {});
      });
    };

    if (!("IntersectionObserver" in window)) {
      warmupSections.forEach(markSectionReady);
      return;
    }

    const warmupObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!mobileQuery.matches || !entry.isIntersecting) {
          return;
        }

        markSectionReady(entry.target);
      });
    }, {
      rootMargin: "720px 0px 720px 0px",
      threshold: 0,
    });

    const syncWarmupObserver = () => {
      warmupSections.forEach((section) => {
        if (mobileQuery.matches) {
          warmupObserver.observe(section);
          return;
        }

        warmupObserver.unobserve(section);
        section.classList.remove("is-section-ready");
      });
    };

    syncWarmupObserver();
    mobileQuery.addEventListener?.("change", syncWarmupObserver);
  };

  warmupMobileSections();

  const closeSiteNav = () => {
    if (!navToggle || !siteNav) {
      return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟導覽選單");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("is-nav-open");

    if (navBackdrop) {
      navBackdrop.hidden = true;
    }
  };

  // 手機版導覽選單：點擊漢堡按鈕開關選單，點背景、按 Esc 或切回桌機尺寸時關閉。
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";

      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "開啟導覽選單" : "關閉導覽選單");
      siteNav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("is-nav-open", !isOpen);

      if (navBackdrop) {
        navBackdrop.hidden = isOpen;
      }
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeSiteNav();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeSiteNav);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSiteNav();
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 769px)").matches) {
        closeSiteNav();
      }
    });
  }

  // 非首頁 header 滾動效果：往下捲隱藏 header，往上捲顯示，讓內容頁閱讀空間更大。
  if (siteHeader && !isIndexPage) {
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      const isNavOpen = navToggle?.getAttribute("aria-expanded") === "true";
      const scrollDistance = currentScrollY - lastScrollY;

      if (isNavOpen || currentScrollY < 12) {
        siteHeader.classList.remove("is-hidden");
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(scrollDistance) < 8) {
        return;
      }

      siteHeader.classList.toggle("is-hidden", scrollDistance > 0);
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

// 首頁企業效益：改成跟 solutions-3 一樣，用 scroll 進度控制 data-step
if (isIndexPage) {
  const applicationCarousel = document.querySelector("[data-application-carousel]");
  const applicationSlides = [
    document.querySelector("#application-scenes-1"),
    document.querySelector("#application-scenes-2"),
    document.querySelector("#application-scenes-3"),
  ].filter(Boolean);

  if (applicationCarousel && applicationSlides.length > 1) {
    const totalApplicationSteps = applicationSlides.length;
    let activeApplicationStep = -1;
    let applicationFrameId = null;

    const getHeaderOffset = () => siteHeader?.offsetHeight || 0;

    const getApplicationScrollableDistance = () => {
      return applicationCarousel.offsetHeight - window.innerHeight + getHeaderOffset();
    };

    const setApplicationStep = (step) => {
      const nextStep = Math.max(0, Math.min(step, totalApplicationSteps - 1));

      if (nextStep === activeApplicationStep) {
        return;
      }

      activeApplicationStep = nextStep;
      applicationCarousel.dataset.step = String(nextStep);

      applicationSlides.forEach((slide, index) => {
        slide.setAttribute("aria-hidden", String(index !== nextStep));
      });
    };

    const updateApplicationStepFromScroll = () => {
      applicationFrameId = null;

      const headerOffset = getHeaderOffset();
      const scrollableDistance = getApplicationScrollableDistance();
      const scrolledDistance = window.scrollY + headerOffset - applicationCarousel.offsetTop;

      const rawProgress = scrollableDistance > 0
        ? scrolledDistance / scrollableDistance
        : 0;

      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const nextStep = Math.round(progress * (totalApplicationSteps - 1));

      setApplicationStep(nextStep);
    };

    const requestApplicationUpdate = () => {
      if (applicationFrameId !== null) {
        return;
      }

      applicationFrameId = window.requestAnimationFrame(updateApplicationStepFromScroll);
    };

    applicationCarousel.dataset.step = "0";
    setApplicationStep(0);

    window.addEventListener("scroll", requestApplicationUpdate, { passive: true });
    window.addEventListener("resize", requestApplicationUpdate);
  }
}


  // 解決方案 3 圖片拆解動畫：依照滾動進度切換 data-step，讓圖片一張張出現或疊加。
  if (featureScrollSection) {
    const totalSteps = 8;
    let activeFeatureStep = -1;
    let featureFrameId = null;
    let isFeatureStepScrolling = false;

    const getFeatureScrollableDistance = () => featureScrollSection.offsetHeight - window.innerHeight;

    const setFeatureStep = (step, shouldSyncScroll = false) => {
      const nextStep = Math.max(0, Math.min(step, totalSteps - 1));

      if (nextStep !== activeFeatureStep) {
        activeFeatureStep = nextStep;
        featureScrollSection.dataset.step = String(nextStep);
      }

      if (!shouldSyncScroll) {
        return;
      }

      const scrollableDistance = getFeatureScrollableDistance();
      const targetTop = featureScrollSection.offsetTop + (scrollableDistance * (nextStep / (totalSteps - 1)));

      isFeatureStepScrolling = true;
      window.scrollTo({
        top: targetTop,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });

      window.setTimeout(() => {
        isFeatureStepScrolling = false;
      }, 420);
    };

    const updateFeatureStepFromScroll = () => {
      featureFrameId = null;

      if (isFeatureStepScrolling) {
        return;
      }

      const scrollableDistance = getFeatureScrollableDistance();
      const scrolledDistance = window.scrollY - featureScrollSection.offsetTop;
      const rawProgress = scrollableDistance > 0 ? scrolledDistance / scrollableDistance : 0;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const nextStep = Math.round(progress * (totalSteps - 1));

      setFeatureStep(nextStep);
    };

    const requestFeatureUpdate = () => {
      if (featureFrameId !== null) {
        return;
      }

      featureFrameId = window.requestAnimationFrame(updateFeatureStepFromScroll);
    };

    const handleFeatureWheel = (event) => {
      const sectionRect = featureScrollSection.getBoundingClientRect();
      const isInsideFeature = sectionRect.top <= 1 && sectionRect.bottom >= window.innerHeight - 1;
      const isScrollingDown = event.deltaY > 0;
      const isScrollingUp = event.deltaY < 0;
      const canStepDown = activeFeatureStep < totalSteps - 1;
      const canStepUp = activeFeatureStep > 0;

      if (!isInsideFeature || Math.abs(event.deltaY) < 12 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        return;
      }

      if ((isScrollingDown && !canStepDown) || (isScrollingUp && !canStepUp)) {
        return;
      }

      event.preventDefault();

      if (isFeatureStepScrolling) {
        return;
      }

      setFeatureStep(activeFeatureStep + (isScrollingDown ? 1 : -1), true);
    };

    featureScrollSection.dataset.step = "0";
    updateFeatureStepFromScroll();
    window.addEventListener("wheel", handleFeatureWheel, { passive: false });
    window.addEventListener("scroll", requestFeatureUpdate, { passive: true });
    window.addEventListener("resize", requestFeatureUpdate);
  }

  // 諮詢申請 CTA 進場動畫：區塊進入畫面時播放手機與卡片動畫，離開後移除 class，回來可重播。
  if (ctaSection) {
    let ctaAnimationFrame = null;

    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        window.cancelAnimationFrame(ctaAnimationFrame);

        if (!entry.isIntersecting) {
          ctaSection.classList.remove("is-cta-animated");
          return;
        }

        ctaSection.classList.remove("is-cta-animated");
        ctaAnimationFrame = window.requestAnimationFrame(() => {
          ctaSection.classList.add("is-cta-animated");
        });
      });
    }, {
      threshold: 0.35,
    });

    ctaObserver.observe(ctaSection);
  }

  // 成功案例影片彈窗：點封面後才建立 YouTube iframe，並自動播放；關閉時清空 iframe 停止播放。
  if (videoButtons.length && videoModal && videoFrame) {
    let activeVideoButton = null;

    const closeVideoModal = () => {
      videoModal.hidden = true;
      videoFrame.innerHTML = "";
      document.body.classList.remove("is-video-open");

      if (activeVideoButton) {
        activeVideoButton.focus();
        activeVideoButton = null;
      }
    };

    const openVideoModal = (button) => {
      const videoId = button.dataset.videoId;
      const videoTitle = button.dataset.videoTitle || "成功案例影片";

      if (!videoId) {
        return;
      }

      activeVideoButton = button;
      videoFrame.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&mute=1&playsinline=1" title="${videoTitle}" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      videoModal.hidden = false;
      document.body.classList.add("is-video-open");

      const closeButton = videoModal.querySelector(".video-modal-close");
      closeButton?.focus();
    };

    videoButtons.forEach((button) => {
      button.addEventListener("click", () => {
        openVideoModal(button);
      });
    });

    videoCloseButtons.forEach((button) => {
      button.addEventListener("click", closeVideoModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !videoModal.hidden) {
        closeVideoModal();
      }
    });
  }

  // 導覽列 active 狀態：首頁點錨點平滑捲動，並依目前看到的 section 更新導覽列底線。
  if (navLinks.length) {
    const samePageSectionLinks = Array.from(navLinks).filter((link) => {
      const href = link.getAttribute("href") || "";
      return href.startsWith("#") && document.querySelector(href);
    });

    if (samePageSectionLinks.length) {
      const sectionMap = new Map(
        samePageSectionLinks.map((link) => [document.querySelector(link.getAttribute("href")), link])
      );
      let isNavAnchorScrolling = false;
      let navAnchorTimer = null;

      const setActiveLink = (activeLink) => {
        samePageSectionLinks.forEach((link) => {
          const isActive = link === activeLink;

          link.classList.toggle("is-active", isActive);

          if (isActive) {
            link.setAttribute("aria-current", "page");
            return;
          }

          link.removeAttribute("aria-current");
        });
      };

      if (isIndexPage) {
        samePageSectionLinks.forEach((link) => {
          link.addEventListener("click", (event) => {
            const href = link.getAttribute("href") || "";
            const targetSection = document.querySelector(href);

            if (!targetSection) {
              return;
            }

            event.preventDefault();

            setActiveLink(link);
            closeSiteNav();
            window.clearTimeout(navAnchorTimer);
            isNavAnchorScrolling = true;

            window.history.pushState(null, "", href);

            window.requestAnimationFrame(() => {
              const headerOffset = siteHeader?.offsetHeight || 0;
              const targetRect = targetSection.getBoundingClientRect();
              const isValueAnchor = href === "#value";
              const targetTop = Math.max(targetRect.top + window.scrollY - headerOffset, 0);

              window.scrollTo({
                top: targetTop,
                behavior: isValueAnchor || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              });

              navAnchorTimer = window.setTimeout(() => {
                isNavAnchorScrolling = false;
              }, isValueAnchor ? 300 : 900);
            });
          });
        });
      }

      if (isIndexPage && window.location.hash) {
        const initialActiveLink = samePageSectionLinks.find((link) => link.getAttribute("href") === window.location.hash);

        if (initialActiveLink) {
          setActiveLink(initialActiveLink);
          window.clearTimeout(navAnchorTimer);
          isNavAnchorScrolling = true;
          navAnchorTimer = window.setTimeout(() => {
            isNavAnchorScrolling = false;
          }, 900);
        }
      }

      if (isIndexPage) {
        let navSpyFrameId = null;

        const getSectionPoints = () => (
          Array.from(sectionMap.entries())
            .map(([section, link]) => ({
              link,
              top: section.getBoundingClientRect().top + window.scrollY,
            }))
            .sort((a, b) => a.top - b.top)
        );

        const updateActiveLinkFromScroll = () => {
          navSpyFrameId = null;

          if (isNavAnchorScrolling) {
            return;
          }

          const headerOffset = siteHeader?.offsetHeight || 0;
          const triggerTop = window.scrollY + headerOffset + (window.innerHeight * 0.35);
          const sectionPoints = getSectionPoints();
          const activePoint = sectionPoints.reduce((currentPoint, nextPoint) => (
            nextPoint.top <= triggerTop ? nextPoint : currentPoint
          ), sectionPoints[0]);

          if (activePoint?.link) {
            setActiveLink(activePoint.link);
          }
        };

        const requestNavSpyUpdate = () => {
          if (navSpyFrameId !== null) {
            return;
          }

          navSpyFrameId = window.requestAnimationFrame(updateActiveLinkFromScroll);
        };

        requestNavSpyUpdate();
        window.addEventListener("scroll", requestNavSpyUpdate, { passive: true });
        window.addEventListener("resize", requestNavSpyUpdate);
      }
    }
  }

  // FAQ 手風琴：第一題預設展開；點收合題目會只打開該題，點已展開題目則可收起。
  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answerId = question.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;
      const isOpen = question.getAttribute("aria-expanded") === "true";

      if (!answer) {
        return;
      }

      faqQuestions.forEach((currentQuestion) => {
        const currentAnswerId = currentQuestion.getAttribute("aria-controls");
        const currentAnswer = currentAnswerId ? document.getElementById(currentAnswerId) : null;
        const shouldOpen = currentQuestion === question && !isOpen;

        currentQuestion.setAttribute("aria-expanded", String(shouldOpen));

        if (currentAnswer) {
          currentAnswer.hidden = !shouldOpen;
        }
      });
    });
  });
});
