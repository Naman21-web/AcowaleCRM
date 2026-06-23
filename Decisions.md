# Engineering Decision Log

## 1. Why did you choose this technology stack?

I chose the MERN stack because I felt it was a good fit for the scope of the project. Since this application is mainly focused on feedback collection, management, and analytics, using React for the frontend and Node.js with Express for the backend allowed me to build everything using JavaScript, which reduced context switching and increased development speed.
React with Vite provided a fast development experience and lightweight build process, while Express kept the backend simple and easy to structure. Overall, the stack offered a good balance between development speed, maintainability, and scalability for a project of this size.

## 2. Why did you choose this database?

I chose MongoDB because the feedback data naturally fits a document-based structure. A feedback submission can contain fields such as category, message, rating, email, and status, and there is a possibility that additional fields may be introduced in the future.
MongoDB's flexible schema allows these changes without requiring database migrations. Another reason was the analytics requirement. Since the dashboard needs aggregated data such as category-wise counts, status breakdowns, and trends over time, MongoDB's aggregation framework made these calculations straightforward and efficient.
A relational database would also have worked, but MongoDB offered more flexibility with less overhead for this particular use case.

## 3. Why did you structure your application this way?

I followed a layered architecture using routes, controllers, models, and middleware because it keeps responsibilities clearly separated while remaining simple enough for a project of this size.
Routes are responsible for defining API endpoints, controllers handle business logic, models manage database interactions, and middleware handles concerns such as authentication and rate limiting.
One design decision I paid special attention to was separating public and admin functionality. Feedback submission endpoints are publicly accessible but protected with rate limiting, while all dashboard and management endpoints require JWT authentication. Since this separation forms the core security model of the application, I wanted it to be clearly visible in the application's structure.

## 4. What trade-offs did you make due to time constraints?

Since this was a time-boxed assignment, I intentionally kept some features simpler.
* Authentication is implemented using a single admin account configured through environment variables instead of a full user management system.
* JWT tokens expire after a fixed duration without refresh token support.
* I focused more on backend validation and testing than frontend testing.
* Attachment and image upload functionality was excluded since it was outside the scope of the assignment.
* Analytics are calculated in real time instead of being precomputed and cached.
These decisions helped me focus on delivering the core requirements while keeping the codebase clean and maintainable.

## 5. What would you improve if you had one more week?

If I had an additional week, I would focus on improving both scalability and user experience.
Some of the improvements I would make include:
* Implementing proper admin user management with role-based access control.
* Adding email or Slack notifications for important feedback categories such as bugs.
* Replacing skip/limit pagination with cursor-based pagination.
* Adding frontend test coverage using React Testing Library.
* Implementing sentiment analysis for feedback comments.
* Adding CSV export functionality for dashboard reports.
* Introducing caching for analytics endpoints to reduce database load.

## 6. What was the most difficult technical challenge you faced?

The most challenging part was designing the analytics system efficiently.
The simplest solution would have been to fetch all feedback records and calculate statistics on the frontend, but that approach would not scale as the dataset grows.
Instead, I created a dedicated analytics endpoint that performs multiple aggregation queries directly in MongoDB. The endpoint calculates metrics such as total feedback count, category distribution, status distribution, average ratings, and recent submission trends.
The most time-consuming part was designing the date-based aggregation pipeline and ensuring the queries remained efficient through proper indexing on fields such as category and createdAt.

## 7. Which AI tools did you use?

I used Claude to assist with generating initial code structures, creating boilerplate implementations, and drafting documentation.
However, all generated code was reviewed, validated, and modified as needed. I also verified the application by running builds, performing manual testing, and reviewing the generated code to ensure it aligned with the project requirements.

## 8. Share one instance where AI helped you.

One area where AI was particularly helpful was generating the initial version of the analytics aggregation pipeline.
The analytics endpoint required multiple related aggregations such as category breakdowns, status counts, trend analysis, and average ratings. AI provided a strong starting point that saved time and allowed me to focus more on validation, optimization, and integration rather than writing every aggregation from scratch.

## 9. Share one instance where you disagreed with AI and why.

One suggestion generated by AI was to fetch all feedback data on the frontend and perform filtering, pagination, and analytics calculations in React.
While this approach would have been simpler to implement initially, it would not scale well as the dataset grows.
I decided to move filtering, searching, pagination, and analytics calculations to the backend instead. This reduced network usage, improved performance, and ensured the dashboard only received the data it actually needed.

## 10. What would break first if this application suddenly had 100,000 users?

The feedback submission flow would likely continue working without major issues because MongoDB handles write operations efficiently and the submission endpoint is already protected by rate limiting.
The first major bottleneck would be the current skip/limit pagination approach. As page numbers increase, MongoDB must scan through a growing number of documents before returning results, which eventually leads to slower queries.
To address this, I would replace skip/limit pagination with cursor-based pagination using fields such as createdAt or _id.
Another area that would require improvement is the analytics endpoint, which currently calculates aggregations in real time. At larger scales, introducing caching or precomputed analytics would significantly reduce database load.

## 11. What is one thing in this assignment that you would improve, change, or challenge?

One requirement I would reconsider is making a publicly accessible live deployment mandatory within a limited assignment timeline.
While deployment is an important skill, setting up hosting platforms, databases, DNS configurations, and SSL certificates often involves more operational work than engineering work.

I believe an application that can be built and run reliably using clear documentation or Docker should be considered equally valid evidence of production readiness. This would allow candidates to spend more time demonstrating their engineering decisions, architecture, code quality, and problem-solving skills rather than focusing on deployment setup.
