import Image from "next/image";
import marcImg from "@/app/blog/_assets/images/authors/marc.png";
// TODO: Add actual blog article images
const placeholderImg = marcImg;

// ==================================================================================================================================================================
// BLOG CATEGORIES 🏷️
// ==================================================================================================================================================================

// These slugs are used to generate pages in the /blog/category/[categoryI].js. It's a way to group articles by category.
const categorySlugs = {
  islamicStudies: "islamic-studies",
  faith: "faith",
  learning: "learning",
};

// All the blog categories data display in the /blog/category/[categoryI].js pages.
export const categories = [
  {
    // The slug to use in the URL, from the categorySlugs object above.
    slug: categorySlugs.islamicStudies,
    // The title to display the category title (h1), the category badge, the category filter, and more. Less than 60 characters.
    title: "Islamic Studies",
    // A short version of the title above, display in small components like badges. 1 or 2 words
    titleShort: "Studies",
    // The description of the category to display in the category page. Up to 160 characters.
    description:
      "Explore articles on Islamic studies, Quranic exegesis, Hadith, and Islamic scholarship.",
    // A short version of the description above, only displayed in the <Header /> on mobile. Up to 60 characters.
    descriptionShort: "Articles on Islamic studies and scholarship.",
  },
  {
    slug: categorySlugs.faith,
    title: "Faith & Spirituality",
    titleShort: "Faith",
    description:
      "Deepen your understanding of faith, spirituality, and Islamic teachings.",
    descriptionShort:
      "Articles on faith and Islamic spirituality.",
  },
  {
    slug: categorySlugs.learning,
    title: "Learning Resources",
    titleShort: "Learning",
    description:
      "Tips, guides, and resources to enhance your Islamic learning journey.",
    descriptionShort:
      "Resources for Islamic learning.",
  },
];

// ==================================================================================================================================================================
// BLOG AUTHORS 📝
// ==================================================================================================================================================================

// Social icons used in the author's bio.
const socialIcons = {
  twitter: {
    name: "Twitter",
    svg: (
      <svg
        version="1.1"
        id="svg5"
        x="0px"
        y="0px"
        viewBox="0 0 1668.56 1221.19"
        className="w-9 h-9"
        // Using a dark theme? ->  className="w-9 h-9 fill-white"
      >
        <g id="layer1" transform="translate(52.390088,-25.058597)">
          <path
            id="path1009"
            d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-390.99   h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"
          />
        </g>
      </svg>
    ),
  },
  linkedin: {
    name: "LinkedIn",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        // Using a dark theme? ->  className="w-6 h-6 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
      </svg>
    ),
  },
  github: {
    name: "GitHub",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        // Using a dark theme? ->  className="w-6 h-6 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
};

// These slugs are used to generate pages in the /blog/author/[authorId].js. It's a way to show all articles from an author.
const authorSlugs = {
  ustadhMubarak: "ustadh-mubarak",
};

// All the blog authors data display in the /blog/author/[authorId].js pages.
export const authors = [
  {
    // The slug to use in the URL, from the authorSlugs object above.
    slug: authorSlugs.ustadhMubarak,
    // The name to display in the author's bio. Up to 60 characters.
    name: "Ustadh Mubarak",
    // The job to display in the author's bio. Up to 60 characters.
    job: "Islamic Scholar & Educator",
    // The description of the author to display in the author's bio. Up to 160 characters.
    description:
      "Ustadh Mubarak is a dedicated Islamic scholar and educator, committed to making authentic Islamic knowledge accessible to Muslims worldwide.",
    // The avatar of the author to display in the author's bio and avatar badge. It's better to use a local image, but you can also use an external image (https://...)
    avatar: marcImg, // TODO: Replace with actual author image
    // A list of social links to display in the author's bio.
    socials: [],
  },
];

// ==================================================================================================================================================================
// BLOG ARTICLES 📚
// ==================================================================================================================================================================

// These styles are used in the content of the articles. When you update them, all articles will be updated.
const styles = {
  h2: "text-2xl lg:text-4xl font-bold tracking-tight mb-4 text-base-content",
  h3: "text-xl lg:text-2xl font-bold tracking-tight mb-2 text-base-content",
  p: "text-base-content/90 leading-relaxed",
  ul: "list-inside list-disc text-base-content/90 leading-relaxed",
  li: "list-item",
  // Altnernatively, you can use the library react-syntax-highlighter to display code snippets.
  code: "text-sm font-mono bg-neutral text-neutral-content p-6 rounded-box my-4 overflow-x-scroll select-all",
  codeInline:
    "text-sm font-mono bg-base-300 px-1 py-0.5 rounded-box select-all",
};

// All the blog articles data display in the /blog/[articleId].js pages.
export const articles = [
  {
    slug: "understanding-usool-at-tafseer",
    title: "Understanding Usūl al-Tafsīr: Principles of Quranic Exegesis",
    description:
      "Learn the fundamental principles and methodologies used by Islamic scholars to correctly interpret and understand the meanings of the Qur'an.",
    categories: [
      categories.find((category) => category?.slug === categorySlugs.islamicStudies) || categories[0],
    ].filter(Boolean),
    author: authors.find((author) => author.slug === authorSlugs.ustadhMubarak),
    publishedAt: "2025-01-15",
    image: {
      src: placeholderImg, // TODO: Replace with actual article image
      urlRelative: "/blog/understanding-usool-at-tafseer/header.jpg",
      alt: "Quranic exegesis and Islamic scholarship",
    },
    content: (
      <>
        <section className="mb-8">
          <Image
            src={placeholderImg}
            alt="Quranic exegesis and Islamic scholarship"
            width={800}
            height={450}
            priority={true}
            className="rounded-box w-full"
          />
        </section>
        <section>
          <h2 className={styles.h2}>Introduction to Usūl al-Tafsīr</h2>
          <p className={styles.p}>
            Usūl al-Tafsīr, or the Principles of Quranic Exegesis, is a foundational science in Islamic scholarship. 
            It provides the essential rules and methodologies that scholars use to correctly understand and interpret the 
            meanings of the Qur&apos;an. Without these principles, interpretation risks becoming arbitrary and disconnected 
            from the authentic understanding of the text.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>The Importance of Proper Methodology</h3>
          <p className={styles.p}>
            The Qur&apos;an is the word of Allah, revealed to guide humanity. To properly understand its message, 
            we must follow the established principles that have been developed by scholars throughout Islamic history. 
            These principles ensure that our understanding remains faithful to the original intent of the revelation.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>Key Principles</h3>
          <ul className={styles.ul}>
            <li className={styles.li}>The Qur&apos;an explains itself (Tafsīr al-Qur&apos;an bi al-Qur&apos;an)</li>
            <li className={styles.li}>The Sunnah provides essential context and explanation</li>
            <li className={styles.li}>The understanding of the Companions (Sahābah) is highly valued</li>
            <li className={styles.li}>Knowledge of Arabic language and grammar is essential</li>
            <li className={styles.li}>Understanding the context of revelation (Asbāb an-Nuzūl)</li>
          </ul>
        </section>
      </>
    ),
  },
  {
    slug: "strengthening-your-faith",
    title: "Strengthening Your Faith: Practical Steps for Muslims",
    description:
      "Discover practical ways to strengthen your faith and deepen your connection with Allah through daily practices and spiritual reflection.",
    categories: [
      categories.find((category) => category?.slug === categorySlugs.faith) || categories[1],
    ].filter(Boolean),
    author: authors.find((author) => author.slug === authorSlugs.ustadhMubarak),
    publishedAt: "2025-01-10",
    image: {
      src: placeholderImg, // TODO: Replace with actual article image
      urlRelative: "/blog/strengthening-your-faith/header.jpg",
      alt: "Islamic faith and spirituality",
    },
    content: (
      <>
        <section className="mb-8">
          <Image
            src={placeholderImg}
            alt="Islamic faith and spirituality"
            width={800}
            height={450}
            priority={true}
            className="rounded-box w-full"
          />
        </section>
        <section>
          <h2 className={styles.h2}>Building a Strong Foundation</h2>
          <p className={styles.p}>
            Faith (Īmān) is not static—it increases and decreases based on our actions, knowledge, and connection with Allah. 
            Strengthening your faith requires consistent effort, knowledge, and practice. This article explores practical 
            steps every Muslim can take to deepen their faith.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>1. Regular Prayer and Remembrance</h3>
          <p className={styles.p}>
            The five daily prayers (Salāh) are the pillars of faith. Establishing them on time and with presence of heart 
            strengthens your connection with Allah. Additionally, regular remembrance (Dhikr) throughout the day keeps your 
            heart connected to the Divine.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>2. Seeking Knowledge</h3>
          <p className={styles.p}>
            Seeking Islamic knowledge is an act of worship. The more you learn about Islam, the stronger your faith becomes. 
            Start with the basics: understanding the Qur&apos;an, learning about the Prophet&apos;s life (Sīrah), and studying 
            the fundamentals of faith (Aqīdah).
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>3. Reflecting on the Qur&apos;an</h3>
          <p className={styles.p}>
            Regular recitation and reflection on the Qur&apos;an nourishes the soul. Even if you don&apos;t understand Arabic, 
            reading translations and contemplating the meanings can profoundly impact your faith. Set aside time daily for 
            this spiritual practice.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: "effective-islamic-learning",
    title: "Effective Islamic Learning: A Student&apos;s Guide",
    description:
      "Learn how to maximize your Islamic studies with effective learning strategies, time management, and study techniques.",
    categories: [
      categories.find((category) => category?.slug === categorySlugs.learning) || categories[2],
    ].filter(Boolean),
    author: authors.find((author) => author.slug === authorSlugs.ustadhMubarak),
    publishedAt: "2025-01-05",
    image: {
      src: placeholderImg, // TODO: Replace with actual article image
      urlRelative: "/blog/effective-islamic-learning/header.jpg",
      alt: "Islamic learning and education",
    },
    content: (
      <>
        <section className="mb-8">
          <Image
            src={placeholderImg}
            alt="Islamic learning and education"
            width={800}
            height={450}
            priority={true}
            className="rounded-box w-full"
          />
        </section>
        <section>
          <h2 className={styles.h2}>The Path of Learning</h2>
          <p className={styles.p}>
            Seeking knowledge is a lifelong journey in Islam. Whether you&apos;re studying Tafsīr, Hadith, Fiqh, or Arabic, 
            effective learning strategies can help you retain information and apply it meaningfully. This guide provides 
            practical tips for Islamic students.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>1. Set Clear Learning Goals</h3>
          <p className={styles.p}>
            Define what you want to achieve in your studies. Are you learning for personal enrichment, to teach others, 
            or to deepen your understanding of a specific topic? Clear goals help you stay focused and motivated.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>2. Create a Study Schedule</h3>
          <p className={styles.p}>
            Consistency is key in learning. Set aside dedicated time each day or week for your studies. Even 30 minutes 
            of focused study is better than sporadic long sessions. Find a time when you&apos;re most alert and can concentrate.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>3. Take Notes and Review</h3>
          <p className={styles.p}>
            Writing helps retention. Take notes during lessons, summarize key points, and review them regularly. The act of 
            writing and reviewing reinforces learning and helps you identify areas that need more attention.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>4. Practice and Apply</h3>
          <p className={styles.p}>
            Knowledge without application is incomplete. Try to apply what you learn in your daily life. If you&apos;re learning 
            about prayer, practice the proper form. If studying Hadith, reflect on how to implement the teachings.
          </p>
        </section>
      </>
    ),
  },
];
