# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.1-release - 2020‑01‑08

### Added

- [@Martin](https://bitbucket.org/%7B2ee175a5-2fc6-49ba-835f-4368509a8318%7D/) Allotment simulator of configuration on arrives edit section
- [@Daniel](https://bitbucket.org/%7Bc9540667-c94f-4469-a3ee-a74e7e27b0bc%7D/) Complement information `Schedules`, `Service equivalence`, `Total tours` per cruise

### Fixed

- [@Wendy](https://bitbucket.org/%7B99b7d82b-d190-4200-9c36-9610f3989d40%7D/) Duplicate validation for role
- [@Wendy](https://bitbucket.org/%7B99b7d82b-d190-4200-9c36-9610f3989d40%7D/) Class name identifier for set and handle event on send button
- [@Daniel](https://bitbucket.org/%7Bc9540667-c94f-4469-a3ee-a74e7e27b0bc%7D/) Condtition on evaluation role

## 1.0-release - 2019‑11‑11

### Added

- [@Wendy](https://bitbucket.org/%7B99b7d82b-d190-4200-9c36-9610f3989d40%7D/) Function `isJson` for handle `jsonParse` to prevent exceptions
- [@Daniel](https://bitbucket.org/%7Bc9540667-c94f-4469-a3ee-a74e7e27b0bc%7D/) Diary section (model, view and controller)

### Changed

- [@Daniel](https://bitbucket.org/%7Bc9540667-c94f-4469-a3ee-a74e7e27b0bc%7D/) Redirect to a default page per role
- [@Adrian](https://bitbucket.org/%7Bc8e1807a-5dda-41ac-b50e-94177f960c2c%7D/) Rename files for `Allotments (List, New, Configuration)`

### Fixed

- [@Adrian](https://bitbucket.org/%7Bc8e1807a-5dda-41ac-b50e-94177f960c2c%7D/) Evaluation for overlap time
- [@Antelmo](https://bitbucket.org/%7B35eadd2b-3249-4f52-82ee-04888cf53f7c%7D/) Correct credentials for `Database`, `API key`, `URL Endpoint`
- [@Antelmo](https://bitbucket.org/%7B35eadd2b-3249-4f52-82ee-04888cf53f7c%7D/) Protocol to `HTTP` to `HTTPS` on fonts resources
- [@Daniel](https://bitbucket.org/%7Bc9540667-c94f-4469-a3ee-a74e7e27b0bc%7D/) Active styles when no exist sub-menu
- [@Adrian](https://bitbucket.org/%7Bc8e1807a-5dda-41ac-b50e-94177f960c2c%7D/) Fix routes for `Allotments`

## 1.0-beta - 2019‑08‑15

### Added

- Default page redirect on login
- Calendar page for visualization all calls on port
- Url for remote [core](https://bitbucket.org/itmgroup/itm-core/src/master/) development server

### Changed

- How to set route for remote server
- Evaluation for HTTP Verbs response
- Evaluation for API connection to get `catalog` on `Form` library

### Removed

- `code` object property on `service, equivalence`
- `code` object property on service `new, update` JS functions

### Fixed

- Protocol to `HTTP` to `HTTPS`
- Correct routes for remote development server
- Sintaxys on function parameters `equivalence.delete`
- Correct number for empty columns on models `service, equivalence`

## 1.0-alpha - 2019‑07‑31

### Added

- Routes for remote development server

### Fixed

- [@Martin](https://bitbucket.org/%7B2ee175a5-2fc6-49ba-835f-4368509a8318%7D/) Jtable plugin crash without data on view `locations` ([#2](https://bitbucket.org/itmgroup/itm-backoffice/issues/2/jtable-crash-ship-bussiness-locations))
- [@Martin](https://bitbucket.org/%7B2ee175a5-2fc6-49ba-835f-4368509a8318%7D/) JTable plugin crash without data on views `reseller, rol, api key` ([#3](https://bitbucket.org/itmgroup/itm-backoffice/issues/3/jtable-crash-reseller-rol-api-key))

## 0.1-alpha - 2019‑07‑29

### Added

- Functionality for show and hide menu on mobile
- Functionality for all elements can invoke signout function
- Event to hide menu after clicking in any section of `DOM`

### Changed

- Function to invoke account menu

### Fixed

- Active menu style
