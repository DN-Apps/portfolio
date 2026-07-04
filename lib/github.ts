type GitHubGraphQlResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: Array<{
            contributionDays?: Array<{
              contributionCount?: number;
              date?: string;
              weekday?: number;
            }>;
          }>;
        };
        commitContributionsByRepository?: Array<{
          repository?: {
            nameWithOwner?: string;
          };
          contributions?: {
            totalCount?: number;
            nodes?: Array<{
              occurredAt?: string;
            }>;
          };
        }>;
        pullRequestContributionsByRepository?: Array<{
          repository?: {
            nameWithOwner?: string;
          };
          contributions?: {
            totalCount?: number;
            nodes?: Array<{
              occurredAt?: string;
            }>;
          };
        }>;
        repositoryContributions?: {
          totalCount?: number;
          nodes?: Array<{
            occurredAt?: string;
            repository?: {
              nameWithOwner?: string;
            };
          }>;
        };
      };
    };
  };
};

type GitHubPublicEvent = {
  type: string;
  repo?: { name?: string };
  created_at?: string;
  payload?: {
    size?: number;
    ref_type?: string;
    action?: string;
    pull_request?: {
      merged?: boolean;
    };
  };
};

type GitHubRepository = {
  name?: string;
  full_name?: string;
  fork?: boolean;
  owner?: { login?: string };
  created_at?: string;
};

type GitHubCommit = {
  commit?: {
    author?: {
      date?: string;
    };
  };
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionWeek = {
  days: ContributionDay[];
};

export type MonthlyActivity = {
  monthKey: string;
  totalCommits: number;
  commitRepositories: Array<{ repo: string; count: number }>;
  createdRepositories: string[];
  openedPullRequests: Array<{ repo: string; count: number }>;
  mergedPullRequests: Array<{ repo: string; count: number }>;
};

export type GitHubOverview = {
  username: string;
  totalContributions: number;
  weeks: ContributionWeek[];
  monthlyActivity: MonthlyActivity[];
  hasGraphData: boolean;
};

const DEFAULT_GITHUB_USERNAME = "DN-Apps";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_REST_URL = "https://api.github.com";
const FALLBACK_REPOS_LIMIT = 6;

function createGitHubRestHeaders(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) {
    return 0;
  }
  if (count <= 1) {
    return 1;
  }
  if (count <= 3) {
    return 2;
  }
  if (count <= 6) {
    return 3;
  }

  return 4;
}

function getMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sortByCountDesc<T extends { count: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.count - a.count);
}

function getOrCreateMonthlyEntry(
  monthlyMap: Map<string, MonthlyActivity>,
  monthKey: string,
): MonthlyActivity {
  const existing = monthlyMap.get(monthKey);

  if (existing) {
    return existing;
  }

  const created: MonthlyActivity = {
    monthKey,
    totalCommits: 0,
    commitRepositories: [],
    createdRepositories: [],
    openedPullRequests: [],
    mergedPullRequests: [],
  };

  monthlyMap.set(monthKey, created);
  return created;
}

function incrementRepoCounter(
  list: Array<{ repo: string; count: number }>,
  repo: string,
  amount = 1,
) {
  if (!repo || amount <= 0) {
    return;
  }

  const existing = list.find((entry) => entry.repo === repo);

  if (existing) {
    existing.count += amount;
    return;
  }

  list.push({ repo, count: amount });
}

function finalizeMonthlyActivity(
  monthlyMap: Map<string, MonthlyActivity>,
): MonthlyActivity[] {
  return [...monthlyMap.values()]
    .map((item) => ({
      ...item,
      commitRepositories: sortByCountDesc(item.commitRepositories),
      openedPullRequests: sortByCountDesc(item.openedPullRequests),
      mergedPullRequests: sortByCountDesc(item.mergedPullRequests),
    }))
    .filter(
      (item) =>
        item.totalCommits > 0 ||
        item.createdRepositories.length > 0 ||
        item.openedPullRequests.length > 0 ||
        item.mergedPullRequests.length > 0,
    )
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

function buildMonthlyActivityFromContributions(
  contributions: GitHubGraphQlResponse["data"] extends { user?: { contributionsCollection?: infer T } }
    ? T
    : never,
): MonthlyActivity[] {
  if (!contributions) {
    return [];
  }

  const monthlyMap = new Map<string, MonthlyActivity>();

  for (const repoBucket of contributions.commitContributionsByRepository ?? []) {
    const repo = repoBucket.repository?.nameWithOwner ?? "";

    for (const node of repoBucket.contributions?.nodes ?? []) {
      if (!node?.occurredAt) {
        continue;
      }

      const date = new Date(node.occurredAt);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const monthKey = getMonthKey(date);
      const month = getOrCreateMonthlyEntry(monthlyMap, monthKey);
      month.totalCommits += 1;
      incrementRepoCounter(month.commitRepositories, repo, 1);
    }
  }

  for (const repoBucket of contributions.pullRequestContributionsByRepository ?? []) {
    const repo = repoBucket.repository?.nameWithOwner ?? "";

    for (const node of repoBucket.contributions?.nodes ?? []) {
      if (!node?.occurredAt) {
        continue;
      }

      const date = new Date(node.occurredAt);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const monthKey = getMonthKey(date);
      const month = getOrCreateMonthlyEntry(monthlyMap, monthKey);
      incrementRepoCounter(month.openedPullRequests, repo, 1);
    }
  }

  for (const node of contributions.repositoryContributions?.nodes ?? []) {
    const repo = node?.repository?.nameWithOwner ?? "";

    if (!node?.occurredAt || !repo) {
      continue;
    }

    const date = new Date(node.occurredAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const monthKey = getMonthKey(date);
    const month = getOrCreateMonthlyEntry(monthlyMap, monthKey);

    if (!month.createdRepositories.includes(repo)) {
      month.createdRepositories.push(repo);
    }
  }

  return finalizeMonthlyActivity(monthlyMap);
}

async function fetchContributionCalendar(
  username: string,
  token: string | undefined,
): Promise<{
  totalContributions: number;
  weeks: ContributionWeek[];
  monthlyActivity: MonthlyActivity[];
}> {
  if (!token) {
    return { totalContributions: 0, weeks: [], monthlyActivity: [] };
  }

  const now = new Date();
  const to = now.toISOString();
  const fromDate = new Date(now);
  fromDate.setUTCFullYear(now.getUTCFullYear() - 1);
  const from = fromDate.toISOString();

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                weekday
              }
            }
          }
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions(first: 100) {
              totalCount
              nodes {
                occurredAt
              }
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions(first: 100) {
              totalCount
              nodes {
                occurredAt
              }
            }
          }
          repositoryContributions(first: 100) {
            totalCount
            nodes {
              occurredAt
              repository {
                nameWithOwner
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        login: username,
        from,
        to,
      },
    }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return { totalContributions: 0, weeks: [], monthlyActivity: [] };
  }

  const payload = (await response.json()) as GitHubGraphQlResponse;
  const contributionsCollection = payload.data?.user?.contributionsCollection;
  const calendar = contributionsCollection?.contributionCalendar;

  const weeks: ContributionWeek[] = (calendar?.weeks ?? []).map((week) => ({
    days: (week.contributionDays ?? [])
      .filter((day): day is { contributionCount?: number; date?: string; weekday?: number } =>
        Boolean(day?.date),
      )
      .sort((a, b) => (a.weekday ?? 0) - (b.weekday ?? 0))
      .map((day) => {
        const count = day.contributionCount ?? 0;

        return {
          date: day.date ?? "",
          count,
          level: toContributionLevel(count),
        };
      }),
  }));

  return {
    totalContributions: calendar?.totalContributions ?? 0,
    weeks,
    monthlyActivity: buildMonthlyActivityFromContributions(contributionsCollection),
  };
}

async function fetchPublicEvents(
  username: string,
  token?: string,
): Promise<GitHubPublicEvent[]> {
  const allEvents: GitHubPublicEvent[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `${GITHUB_REST_URL}/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
      {
        headers: createGitHubRestHeaders(token),
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) {
      break;
    }

    const pageData = (await response.json()) as GitHubPublicEvent[];
    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    allEvents.push(...pageData);

    const oldestInPage = pageData[pageData.length - 1];
    const oldestDate = oldestInPage?.created_at
      ? new Date(oldestInPage.created_at)
      : null;

    if (oldestDate && oldestDate < oneYearAgo) {
      break;
    }
  }

  return allEvents;
}

async function fetchUserRepositories(
  username: string,
  token?: string,
): Promise<GitHubRepository[]> {
  const repositories: GitHubRepository[] = [];

  for (let page = 1; page <= 4; page += 1) {
    const response = await fetch(
      `${GITHUB_REST_URL}/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=${page}`,
      {
        headers: createGitHubRestHeaders(token),
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      break;
    }

    const pageData = (await response.json()) as GitHubRepository[];

    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    repositories.push(...pageData);
  }

  return repositories
    .filter((repo) => !repo.fork)
    .slice(0, FALLBACK_REPOS_LIMIT);
}

async function fetchRepositoryCommits(
  owner: string,
  repository: string,
  sinceIso: string,
  token?: string,
): Promise<GitHubCommit[]> {
  const commits: GitHubCommit[] = [];

  for (let page = 1; page <= 3; page += 1) {
    const response = await fetch(
      `${GITHUB_REST_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits?since=${encodeURIComponent(sinceIso)}&per_page=100&page=${page}`,
      {
        headers: createGitHubRestHeaders(token),
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      break;
    }

    const pageData = (await response.json()) as GitHubCommit[];

    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    commits.push(...pageData);

    if (pageData.length < 100) {
      break;
    }
  }

  return commits;
}

function buildMonthlyActivity(events: GitHubPublicEvent[]): MonthlyActivity[] {
  const monthlyMap = new Map<string, MonthlyActivity>();

  for (const event of events) {
    if (!event.created_at) {
      continue;
    }

    const eventDate = new Date(event.created_at);
    if (Number.isNaN(eventDate.getTime())) {
      continue;
    }

    const monthKey = getMonthKey(eventDate);
    const existing = getOrCreateMonthlyEntry(monthlyMap, monthKey);

    const repoName = event.repo?.name ?? "";

    if (event.type === "PushEvent") {
      const commitCount =
        typeof event.payload?.size === "number" && event.payload.size > 0
          ? event.payload.size
          : 0;

      if (commitCount > 0) {
        existing.totalCommits += commitCount;

        const repoEntry = existing.commitRepositories.find(
          (entry) => entry.repo === repoName,
        );

        if (repoEntry) {
          repoEntry.count += commitCount;
        } else if (repoName) {
          existing.commitRepositories.push({ repo: repoName, count: commitCount });
        }
      }
    }

    if (event.type === "CreateEvent" && event.payload?.ref_type === "repository") {
      if (repoName && !existing.createdRepositories.includes(repoName)) {
        existing.createdRepositories.push(repoName);
      }
    }

    if (
      event.type === "PullRequestEvent" &&
      event.payload?.action === "opened" &&
      repoName
    ) {
      incrementRepoCounter(existing.openedPullRequests, repoName, 1);
    }

    if (
      event.type === "PullRequestEvent" &&
      event.payload?.action === "closed" &&
      event.payload?.pull_request?.merged === true &&
      repoName
    ) {
      incrementRepoCounter(existing.mergedPullRequests, repoName, 1);
    }

    monthlyMap.set(monthKey, existing);
  }

  return finalizeMonthlyActivity(monthlyMap);
}

async function buildMonthlyActivityFromPublicFallback(
  username: string,
  token?: string,
): Promise<MonthlyActivity[]> {
  const [events, repositories] = await Promise.all([
    fetchPublicEvents(username, token),
    fetchUserRepositories(username, token),
  ]);

  const monthlyMap = new Map<string, MonthlyActivity>();
  const fromDate = new Date();
  fromDate.setUTCFullYear(fromDate.getUTCFullYear() - 1);
  const fromIso = fromDate.toISOString();

  for (const item of buildMonthlyActivity(events)) {
    monthlyMap.set(item.monthKey, {
      ...item,
      commitRepositories: [...item.commitRepositories],
      createdRepositories: [...item.createdRepositories],
      openedPullRequests: [...item.openedPullRequests],
      mergedPullRequests: [...item.mergedPullRequests],
    });
  }

  for (const repository of repositories) {
    const owner = repository.owner?.login;
    const name = repository.name;
    const fullName = repository.full_name ?? "";

    if (!owner || !name || !fullName) {
      continue;
    }

    if (repository.created_at) {
      const createdAt = new Date(repository.created_at);

      if (!Number.isNaN(createdAt.getTime()) && createdAt >= fromDate) {
        const createdMonth = getMonthKey(createdAt);
        const monthEntry = getOrCreateMonthlyEntry(monthlyMap, createdMonth);

        if (!monthEntry.createdRepositories.includes(fullName)) {
          monthEntry.createdRepositories.push(fullName);
        }
      }
    }

    const commits = await fetchRepositoryCommits(
      owner,
      name,
      fromIso,
      token,
    );

    for (const commit of commits) {
      const commitDate = commit.commit?.author?.date;

      if (!commitDate) {
        continue;
      }

      const date = new Date(commitDate);

      if (Number.isNaN(date.getTime()) || date < fromDate) {
        continue;
      }

      const monthKey = getMonthKey(date);
      const monthEntry = getOrCreateMonthlyEntry(monthlyMap, monthKey);
      monthEntry.totalCommits += 1;
      incrementRepoCounter(monthEntry.commitRepositories, fullName, 1);
    }
  }

  return finalizeMonthlyActivity(monthlyMap);
}

export async function getGitHubOverview(): Promise<GitHubOverview> {
  const username = process.env.GITHUB_USERNAME?.trim() || DEFAULT_GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN?.trim();

  const calendar = await fetchContributionCalendar(username, token);

  const fallbackMonthlyActivity =
    calendar.monthlyActivity.length === 0
      ? await buildMonthlyActivityFromPublicFallback(username, token)
      : [];

  return {
    username,
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
    monthlyActivity:
      calendar.monthlyActivity.length > 0
        ? calendar.monthlyActivity
        : fallbackMonthlyActivity,
    hasGraphData: calendar.weeks.length > 0,
  };
}
