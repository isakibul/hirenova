"use client";

import Icon from "@components/Icon";
import SelectField from "@components/forms/SelectField";
import { useCallback, useEffect, useState } from "react";

const sortOptions = [
    { value: "updatedAt", label: "Recently Updated" },
    { value: "createdAt", label: "Newest Joined" },
    { value: "username", label: "Name" },
    { value: "experience", label: "Experience" },
];

function getMessage(body, fallback) {
    return body?.error ?? body?.message ?? fallback;
}

function getCandidateId(candidate) {
    return candidate.id ?? candidate._id ?? "";
}

function formatDate(value) {
    if (!value) {
        return "Not available";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function formatExperience(value) {
    if (typeof value !== "number") {
        return "Not set";
    }
    return `${value} year${value === 1 ? "" : "s"}`;
}

function formatSkills(skills) {
    return Array.isArray(skills) && skills.length ? skills : ["No skills listed"];
}

export default function CandidatesClient({ initialCandidates = [], initialPagination, initialError = "" }) {
    const [candidates, setCandidates] = useState(initialCandidates);
    const [pagination, setPagination] = useState(initialPagination);
    const [selectedCandidate, setSelectedCandidate] = useState(initialCandidates[0] ?? null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("updatedAt");
    const [sortType, setSortType] = useState("dsc");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCandidateId, setLoadingCandidateId] = useState(null);
    const [error, setError] = useState(initialError);
    const totalItems = pagination?.totalItems ?? candidates.length;
    const totalPages = pagination?.totalPage ?? 1;

    const loadCandidates = useCallback(async () => {
        setIsLoading(true);
        setError("");
        const params = new URLSearchParams({
            page: String(page),
            limit: "10",
            sort_by: sortBy,
            sort_type: sortType,
        });
        if (search) {
            params.set("search", search);
        }
        try {
            const response = await fetch(`/api/candidates?${params.toString()}`);
            const body = await response.json();
            if (!response.ok) {
                throw new Error(getMessage(body, "Unable to load candidates."));
            }
            const nextCandidates = body.data ?? [];
            setCandidates(nextCandidates);
            setPagination(body.pagination);
            setSelectedCandidate((current) => {
                const currentId = current ? getCandidateId(current) : "";
                return nextCandidates.find((candidate) => getCandidateId(candidate) === currentId) ?? nextCandidates[0] ?? null;
            });
        }
        catch (caughtError) {
            setCandidates([]);
            setPagination(undefined);
            setSelectedCandidate(null);
            setError(caughtError instanceof Error ? caughtError.message : "Unable to load candidates.");
        }
        finally {
            setIsLoading(false);
        }
    }, [page, search, sortBy, sortType]);

    useEffect(() => {
        if (page === 1 && !search && sortBy === "updatedAt" && sortType === "dsc") {
            return;
        }
        const timeoutId = window.setTimeout(() => {
            void loadCandidates();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadCandidates, page, search, sortBy, sortType]);

    async function handleSelectCandidate(candidate) {
        const candidateId = getCandidateId(candidate);
        if (!candidateId) {
            return;
        }
        setLoadingCandidateId(candidateId);
        setError("");
        try {
            const response = await fetch(`/api/candidates/${candidateId}`);
            const body = await response.json();
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body, "Unable to load candidate profile."));
            }
            setSelectedCandidate(body.data);
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to load candidate profile.");
        }
        finally {
            setLoadingCandidateId(null);
        }
    }

    function handleSearch(event) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    return (<section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">Employer</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Job Seekers</h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Search active candidate profiles by name, email, skill, or preferred location.
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Candidates</p>
            <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
          </div>
        </div>

        {error ? <div className="site-danger mt-5 rounded-lg border px-4 py-3 text-sm">{error}</div> : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_410px]">
          <div className="site-border site-card overflow-hidden rounded-lg border">
            <div className="site-panel border-b border-[var(--site-border)] p-4">
              <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_190px_140px]">
                <label className="relative">
                  <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="search"/>
                  </span>
                  <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none" placeholder="Search skills, location, name"/>
                </label>
                <SelectField value={sortBy} onChange={(nextValue) => {
            setPage(1);
            setSortBy(nextValue);
        }} options={sortOptions} className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"/>
                <button type="submit" className="site-button h-10 rounded-md px-3 text-sm font-semibold transition">Search</button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => {
            setPage(1);
            setSortType((current) => current === "dsc" ? "asc" : "dsc");
        }} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold">
                  {sortType === "dsc" ? "Descending" : "Ascending"}
                </button>
                {search ? (<button type="button" onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
            }} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold">
                    Clear Search
                  </button>) : null}
              </div>
            </div>

            <div className="divide-y divide-[var(--site-border)]">
              {isLoading ? (<div className="site-muted px-4 py-10 text-center text-sm">Loading candidates...</div>) : candidates.length === 0 ? (<div className="px-4 py-10 text-center">
                  <p className="font-semibold">No job seekers found</p>
                  <p className="site-muted mt-1 text-xs">Try another skill, location, or name.</p>
                </div>) : candidates.map((candidate) => {
            const candidateId = getCandidateId(candidate);
            const isSelected = getCandidateId(selectedCandidate ?? {}) === candidateId;
            return (<button key={candidateId} type="button" onClick={() => handleSelectCandidate(candidate)} className={`block w-full px-4 py-4 text-left transition hover:bg-[var(--site-panel)] ${isSelected ? "bg-[var(--site-panel)]" : ""}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{candidate.username ?? "Unnamed candidate"}</p>
                        <p className="site-muted mt-1 break-all text-xs">{candidate.email ?? "No email"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formatSkills(candidate.skills).slice(0, 5).map((skill) => (<span key={skill} className="site-badge rounded px-2 py-1 text-xs font-semibold">{skill}</span>))}
                        </div>
                      </div>
                      <div className="site-muted shrink-0 text-xs md:text-right">
                        <p>{formatExperience(candidate.experience)}</p>
                        <p className="mt-1">{candidate.preferredLocation || "Location not set"}</p>
                        {loadingCandidateId === candidateId ? <p className="mt-1">Loading profile...</p> : null}
                      </div>
                    </div>
                  </button>);
        })}
            </div>

            <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="site-muted text-xs">Page {pagination?.page ?? page} of {totalPages}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1 || isLoading} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Previous</button>
                <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={page >= totalPages || isLoading} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>

          <aside className="site-border site-card self-start rounded-lg border">
            <div className="border-b border-[var(--site-border)] px-4 py-3">
              <h2 className="font-semibold">Candidate Profile</h2>
              <p className="site-muted mt-1 text-xs">Select a job seeker to view profile details.</p>
            </div>
            {selectedCandidate ? (<div className="space-y-4 p-4 text-sm">
                <div>
                  <p className="site-muted text-xs font-medium">Name</p>
                  <p className="mt-1 font-semibold">{selectedCandidate.username ?? "Not set"}</p>
                </div>
                <div>
                  <p className="site-muted text-xs font-medium">Email</p>
                  <p className="mt-1 break-all font-semibold">{selectedCandidate.email ?? "Not set"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="site-muted text-xs font-medium">Experience</p>
                    <p className="mt-1 font-semibold">{formatExperience(selectedCandidate.experience)}</p>
                  </div>
                  <div>
                    <p className="site-muted text-xs font-medium">Location</p>
                    <p className="mt-1 font-semibold">{selectedCandidate.preferredLocation || "Not set"}</p>
                  </div>
                </div>
                <div>
                  <p className="site-muted text-xs font-medium">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatSkills(selectedCandidate.skills).map((skill) => (<span key={skill} className="site-badge rounded px-2 py-1 text-xs font-semibold">{skill}</span>))}
                  </div>
                </div>
                <div>
                  <p className="site-muted text-xs font-medium">Resume</p>
                  {selectedCandidate.resumeUrl ? (<a href={selectedCandidate.resumeUrl} target="_blank" rel="noreferrer" className="site-link mt-1 inline-block break-all font-semibold">Open resume</a>) : (<p className="mt-1 font-semibold">Not set</p>)}
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-[var(--site-border)] pt-4">
                  <div>
                    <p className="site-muted text-xs font-medium">Joined</p>
                    <p className="mt-1 font-semibold">{formatDate(selectedCandidate.createdAt)}</p>
                  </div>
                  <div>
                    <p className="site-muted text-xs font-medium">Updated</p>
                    <p className="mt-1 font-semibold">{formatDate(selectedCandidate.updatedAt)}</p>
                  </div>
                </div>
              </div>) : (<div className="site-muted p-4 text-sm">No candidate selected.</div>)}
          </aside>
        </div>
      </div>
    </section>);
}
