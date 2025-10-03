# Workflow Optimizations for test-e2e Job

## Overview
The `test-e2e` job has been optimized to reduce execution time from ~8 minutes to ~2-3 minutes on subsequent runs by implementing caching strategies.

## Optimizations Implemented

### 1. NPM Dependency Caching
**Before:** ~1m 38s  
**After:** ~10-20s (with cache hit)

- Added `cache: 'npm'` to `actions/setup-node@v4`
- Specified `cache-dependency-path: ./ui/package-lock.json`
- Cache is automatically invalidated when package-lock.json changes
- Applied to both `tests-unit` and `test-e2e` jobs for consistency

### 2. Playwright Browser Caching
**Before:** ~4m 44s  
**After:** ~10s (with cache hit)

- Added `actions/cache@v4` to cache Playwright browsers
- Cache path: `~\AppData\Local\ms-playwright` (Windows-specific)
- Cache key includes Playwright version from package.json
- Browser installation is conditional - only runs if cache miss
- Cache is automatically invalidated when Playwright version changes

### 3. Expected Performance Impact

| Step | Before | After (Cache Hit) | Savings |
|------|--------|-------------------|---------|
| Install dependencies | 1m 38s | ~10-20s | ~1m 20s |
| Install Playwright Browsers | 4m 44s | ~10s | ~4m 34s |
| **Total Savings** | - | - | **~5-6 minutes** |

**First run:** ~8m 20s (same as before, cache miss)  
**Subsequent runs:** ~2-3m (with cache hits)

## Why Not Cache More?

### Electron Packaging (1m 5s)
We decided **not** to cache the electron-forge packaging output because:
- Complex cache key required (would need to hash all source files)
- Risk of cache invalidation issues
- Platform-specific binaries might not cache correctly
- Relatively fast compared to other steps
- Incorrect cache could lead to false test results

### Other Considerations
- Vite build caching: Already handled by vite internally
- Test artifacts: Not needed between runs
- Git checkout: Already optimized by GitHub Actions

## Cache Behavior

### Cache Keys
- NPM: Automatically managed by `setup-node` action
- Playwright: `${{ runner.os }}-playwright-${{ steps.playwright-version.outputs.version }}`

### Cache Invalidation
- NPM cache: Invalidated when `package-lock.json` changes
- Playwright cache: Invalidated when `@playwright/test` version changes

### Cache Storage
- GitHub Actions cache storage limit: 10 GB per repository
- Our caches are relatively small (~500MB total)
- Old caches are automatically evicted after 7 days of no use

## Monitoring

To verify the optimization is working:
1. Check workflow run logs for "Cache restored from key" messages
2. Compare execution times between runs
3. First run after cache invalidation will be slower

## Future Optimizations

Potential areas for future improvement:
1. Use `pnpm` instead of `npm` for faster installs (requires package manager migration)
2. Reduce Playwright test suite size or run tests in parallel
3. Consider using Docker images with pre-installed browsers for even faster setup
4. Investigate if electron-forge supports incremental builds
