import axios from 'axios';
import User from '../models/User.js';

const GITHUB_API = 'https://api.github.com';

export async function fetchAndStoreGitHubData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Fetch basic user info
    const userRes = await axios.get(`${GITHUB_API}/users/${user.githubUsername}`, {
      headers: { 'User-Agent': 'Profile-Playground-App' }
    });
    const gh = userRes.data;

    // Get repos (simple - first page, up to 100 repos)
    // For real production you should paginate all repos
    const reposRes = await axios.get(
      `${GITHUB_API}/users/${user.githubUsername}/repos?per_page=100`,
      { headers: { 'User-Agent': 'Profile-Playground-App' } }
    );

    const totalStars = reposRes.data.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

    const githubData = {
      fetchedAt: new Date(),
      avatarUrl: gh.avatar_url,
      name: gh.name,
      bio: gh.bio,
      company: gh.company,
      location: gh.location,
      blog: gh.blog,
      followers: gh.followers,
      following: gh.following,
      publicRepos: gh.public_repos,
      totalStars,
      createdAt: gh.created_at,
    };

    // Save to database
    user.profile.githubData = githubData;
    user.profile.links.github = `https://github.com/${user.githubUsername}`;
    await user.save();

    return githubData;
  } catch (error) {
    console.error('GitHub data fetch failed:', error.message);
    throw error; // Will be caught by controller
  }
}