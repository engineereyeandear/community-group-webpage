# Community Gatherings App — System Design Document (v1)

## Overview

This document describes the initial system design for a community web application aimed at Christian gatherings, built to help people connect around spiritual and educational discussion. The core idea is simple: someone signs up with their email, creates a profile, and joins a group representing their church or community. From there, members can suggest topics they'd like to discuss at upcoming gatherings, and once a topic is chosen for an upcoming session, everyone in that group is notified so they know what to expect and can prepare.

This is written as a living document. It reflects the scope we've discussed so far, including the key decisions below, and will keep evolving as the app grows past this first version. See "What's Been Built Since Version 1" below for what's actually been added on top of this original plan.

## Key Decisions

Four questions about how the app should behave have been settled and shape everything below. Joining a group is not instant — a person requests to join, and the group's leader has to approve the request before they become a member. A person can belong to several groups at once, not just one, so the "your groups" experience needs to account for more than a single membership. Creating a brand-new group (church) is restricted to the platform administrator rather than open to any user — members choose from groups that already exist rather than spinning up their own. And when a group leader selects a topic for discussion, they attach a specific date and time to it, and that date and time is included in the notification members receive.

## Goals for Version 1

The first version should let a new visitor sign up with nothing more than an email address, land on a simple profile, and request to join a group that represents their church or community, pending that group leader's approval. Once part of one or more groups, a member should be able to suggest a topic they'd like the group to discuss, see what others have suggested, and — when a group leader selects a topic and sets a date and time for the next gathering — receive a notification with those details. Everything beyond that (voting on topics, multiple leaders per group, in-app chat, calendar integration, and so on) is worth designing for but not required to ship the first working version.

## Who Uses the App

Three kinds of people interact with the system. A regular member is anyone who has signed up, requested and been approved into one or more groups, and can suggest topics and receive notifications. A group leader is a member with additional standing within a specific group: they approve or decline join requests, review suggested topics, and mark one as selected with a date and time for an upcoming gathering, which is what triggers the notification to everyone in that group. A platform administrator oversees the app as a whole and is the only one who can create new groups (churches) for members to discover and request to join — for version 1, that role will most likely just be you.

## Core Features

Account creation is built around email rather than a traditional username-and-password pair. The simplest and most secure approach for people who aren't necessarily technical is a magic-link sign-in: someone enters their email, receives a one-time link, and clicking it both verifies their address and logs them in, with no password to create, remember, or leak. After signing up, a person fills out a lightweight profile consisting of at least a display name, with a bio or photo as an easy addition later.

Joining a group is the next step in onboarding, and it's a two-sided process. A member browses a list of available groups (each representing a specific church or community, created by the platform administrator), searches by name, and sends a join request to the one that fits — and can send requests to more than one group, since membership isn't limited to a single group. That request sits pending until the group's leader approves or declines it, and only after approval does the person become a full member able to see and suggest topics within that group.

Suggesting a topic is available to any approved member of a group. A suggestion consists of a short title and an optional description of what the person would like the group to explore, and it becomes visible to the rest of the group as a running list of ideas. Members can vote on suggestions to help surface the most popular ones — this was originally scoped as a later addition, but has since been built; see "What's Been Built Since Version 1" for how it actually works.

Selecting a topic is the group leader's responsibility. From the list of suggestions, the leader marks one as selected and sets the date and time of the gathering where it will be discussed. This action is the trigger for the next feature.

Notifying members happens automatically once a topic is selected. Every approved member of that group receives an email stating which topic was chosen along with the date and time of the gathering, so the notification reads like a concrete heads-up rather than a vague announcement. In-app notifications (a simple "what's new" indicator inside the app itself) are a reasonable addition once the email flow is working, but email alone is enough to ship version 1.

## Data Model

A **user** record holds the essentials for anyone who has signed up: a unique identifier, their email address, a display name, and a timestamp for when they joined. Because authentication is magic-link based, there's no password to store at all, which simplifies both the schema and the security posture.

A **group** record represents a single church or community: an identifier, its name, an optional description, and a timestamp for when it was created. Only the platform administrator can create these records, so there's no user-facing "create a group" flow to build for version 1 — just an admin-only path, which could be as simple as an admin-only screen or even a direct database insert to start with. Ownership of which user or users act as that group's leader is captured separately rather than baked into this record, so that a group can have its leadership changed or expanded without altering the group itself.

A **membership** record is the link between a user and a group: it notes which user belongs to which group, what role they hold within it (member or leader), when they joined, and a status of pending or active — pending until the group leader approves the request, active afterward. Structuring membership as its own record rather than a simple list on the user or group is what makes belonging to several groups at once straightforward: a user simply has multiple membership records, one per group, each with its own status and role.

A **topic** record captures a single suggestion: which group it belongs to, who suggested it, its title and description, its current status (suggested, selected, or archived), and when it was created. Once a topic is selected, the record also carries the specific date and time of the gathering where it will be discussed — that detail is what gets included in the notification, so it's treated as a required field at the point of selection rather than an optional extra. A selected topic is automatically moved to "archived" once its gathering date has passed, so it drops out of the group's active list without the record being deleted.

A **vote** record links a user to a specific topic (not just to a group), which is what allows a member to vote for more than one suggested topic in the same group at once — the constraint is one vote per person per topic, not one vote per person per group.

A **notification** record tracks what was sent, to whom, and about which topic — useful both for debugging delivery issues and for later showing someone a history of what they've been notified about, even though the actual delivery for version 1 happens over email rather than through anything stored and displayed in-app.

## Technical Approach

Given that the app needs both a user-facing interface and server-side logic (handling sign-ups, group membership, and sending notifications), a full-stack JavaScript framework keeps the toolchain simple: one language, one project, one deployment. Next.js is a strong fit here, since it handles both the pages people see and the backend API routes that do the work, all within a single codebase — useful when you're leaning on me to write most of the code and want to avoid juggling a separate frontend and backend project.

For the database and authentication, a hosted service such as Supabase removes the need to install or manage a database server at all: it provides a Postgres database, built-in email magic-link authentication out of the box, and a straightforward way to send transactional emails for the notification feature (or it can hand that off to a dedicated email service like Resend if we want more control over how notification emails look). Styling with Tailwind CSS keeps visual work fast without requiring deep CSS knowledge going in. For hosting, Vercel pairs naturally with Next.js and deploys automatically from GitHub every time code is pushed, which also means your GitHub account becomes the natural home for the project's source code and the trigger point for getting changes live.

None of this requires installing a database server, a separate backend runtime, or anything beyond what you already have (Node.js, Git, and VS Code) plus accounts with GitHub, Supabase, and Vercel, all of which have functional free tiers for a project at this stage.

## A Word on Trust and Data

Because this app deals with people's religious community involvement and the topics they want to discuss, it's worth being deliberate about privacy even at this early stage: collect only the email and display name needed to operate the app, avoid exposing a member's email address to other members (a display name is enough for group visibility), and make sure a straightforward way to delete an account and its data exists from the start rather than being added as an afterthought.

## Suggested Build Order

The first working slice should be account creation and profile: a person can sign up with email, verify via the magic link, and see a basic profile page. The next slice adds groups: a seeded list of a few real churches (added by you as platform administrator) that a member can browse and send a join request to, plus the group leader's screen for approving or declining those requests. After that comes topic suggestion, where an approved member can post an idea to their group and see everyone else's. The final slice for version 1 is topic selection and notification: a leader marks a topic as selected, sets its date and time, and members receive an email with those details. Each of these slices is independently useful and testable, which makes it easier to see real progress and adjust course early rather than building everything at once and discovering problems late.

## What's Been Built Since Version 1

The prototype has grown past this original plan in a few ways worth recording here:

Members can now vote on suggested topics, and for as many different topics in a group as they like — voting isn't limited to a single choice. A group leader sets a voting deadline, which can be moved forward again later to reopen voting if needed, and once voting closes, votes are locked in for that round. Clicking a topic's vote button again removes that specific vote, so a member can freely change their mind about which topics they're backing.

A selected topic is automatically archived once its gathering date and time have passed, keeping the "Discussion topics" list focused on what's current rather than accumulating every gathering the group has ever had. The record itself isn't deleted, so a "past topics" history view remains an easy addition later.

Alongside the original passwordless email-link sign-in, members can now optionally set a password (at sign-up, or later from their profile) to log in directly, and a "forgot password" flow lets them reset it if forgotten — both still working entirely locally for this prototype, the same way the sign-in link does, with no real email service wired up yet.

The interface has also been given a visual pass: icons throughout the UI, a warmer color palette in place of the original blue, and a round of accessibility fixes to text and buttons that had too little contrast against their background to read comfortably.

## Still Open for Later

A few things remain worth deciding as the app matures further, though none of them block continuing to build. Whether in-app notifications should eventually be supplemented by real emails once a hosted email service is connected, and whether a gathering should become its own record independent of a single topic (so one session could cover more than one topic), are both reasonable future questions the data model is already flexible enough to accommodate without a rework.

With the key decisions settled, the next step is scaffolding the actual Next.js project and setting up the Supabase project it will connect to.
