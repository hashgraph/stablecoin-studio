# Custodial Wallets Library

### Table of Contents

- **[Overview](#overview)**<br>
- **[Architecture](#architecture)**<br>
- **[Content](#content)**<br>
- **[Technologies](#technologies)**<br>
- **[How to use it](#how-to-use-it)**<br>
  - [Install](#install)<br>
  - [Import](#import)<br>
  - [Run](#run)<br>
- **[Build](#build)**<br>
- **[Test](#test)**<br>
  - [Files](#files)<br>
  - [Configuration](#configuration)<br>
  - [Run](#run)<br>
- **[Contributing](#contributing)**<br>
- **[Code of conduct](#code-of-conduct)**<br>
- **[License](#license)**<br>

# Overview

The _custodialwalletutils_ library is a dedicated Typescript utility library crafted to streamline the intricacies of custodial wallet management. Its purpose is to furnish developers with a collection of functions and classes that abstract the complexities associated with custodial wallets. By doing so, developers can channel their efforts towards refining the core logic of their applications. While the library is tailored for seamless integration with the Hedera network and related software solutions, it is designed with scalability in mind, ensuring adaptability for a wide array of custodial wallet services.

Presently, the library supports custodial wallet services such as Fireblocks and Dfns, with a commitment to facilitating easy integration for additional services in the future.

The library's organizational structure is rooted in a well-defined directory layout, with the source code housed in the src/ directory and unit tests residing in the tests/ directory. Within the source code, a diverse array of utility functions and classes has been meticulously crafted, each serving a specific role in custodial wallet management.

Developed using modern Typescript and optimized for the Node.js runtime environment, the custodialwalletutils library is orchestrated through npm. This package manager streamlines tasks such as handling dependencies, building the library, and executing tests.

Utilizing the library involves a straightforward process: developers can install it via npm, import the necessary functions or classes into their code, and seamlessly integrate them as needed. The library prioritizes ease of use, emphasizing a positive developer experience and fostering code readability.

Complementing its array of utility functions and classes, the custodialwalletutils library includes a robust suite of unit tests. These tests play a pivotal role in guaranteeing the reliability and stability of the library, solidifying its standing as a dependable choice for managing custodial wallets within Typescript applications.

# Architecture

The custodialwalletutils library follows a factory pattern, which allows for the creation of objects without specifying the exact class of the object that will be created. This design pattern is particularly useful when the object setup process is complex or when the program needs to create different types of objects that share a common super class.

The library is structured into two main directories:

- `src/`: this is where the source code of the custodialwalletutils library resides. This directory contains all the utility functions and classes that are part of the library. The main components of the library are the factory classes. These classes follow the factory pattern, which allows for the creation of objects without specifying the exact class of the object that will be created. This is particularly useful when the object setup process is complex or when the program needs to create different types of objects that share a common super class.

  Each factory class is responsible for creating instances of the different types of custodial wallets. They encapsulate the logic needed to create a specific type of custodial wallet, abstracting this complexity away from the client code. This makes it easier for developers to create and manage custodial wallets without having to understand the underlying details. In addition to the factory classes, the `src/` directory also contains various helper functions and classes. These are used by the factory classes to perform specific tasks related to the creation and management of custodial wallets. They further simplify the code and improve its readability and maintainability.

  The `src/` directory is an essential part of the library. It contains the core functionality of the library and is where most of the development work takes place.

- `tests/`: The `tests/` directory is a crucial part of the custodialwalletutils library. It contains all the unit tests for the utility functions and classes that are part of the library.

  Unit tests are small, isolated tests that check the correctness of a single function or class. They are an essential part of any software project, as they help to ensure that each part of the codebase works as expected. They can also help to catch and prevent bugs from being introduced into the codebase. In the context of the custodialwalletutils library, the unit tests in the `tests/` directory are designed to test the functionality of the utility functions and classes in the `src/` directory. Each test file typically corresponds to a single source file and contains multiple tests for the different functions or classes in that file.

  The tests are written using a testing framework, which provides a set of tools and functions for defining and running tests. The tests themselves are written in JavaScript and are designed to be run in the Node.js environment. When a test is run, it will call the function or class being tested with a set of predefined inputs and then check that the output is as expected. If the output matches the expected result, the test passes. If not, the test fails, indicating that there is a problem with the code.

  The `tests/` directory is an essential part of the development process. Before any changes are made to the codebase, the tests should be run to ensure that the existing code is working correctly. After changes are made, the tests should be run again to ensure that the changes have not introduced any new bugs. If new functionality is added to the codebase, new tests should be written to test this functionality.

In addition to ensuring the correctness of the code, the tests also serve as a form of documentation. They provide examples of how the functions and classes should be used and what their expected behavior is. This can be very helpful for developers who are new to the codebase or who are working on complex features.

The custodialwalletutils library is designed to be easy to use, with a focus on developer experience and code readability. It provides a robust suite of utility functions and classes, making it a dependable choice for managing custodial wallets in JavaScript applications.

# Content

# Technologies

# How to use it

## Install

## Import

## Run

# Build

# Test

## Files

## Configuration

## Run

# Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

# Code of Conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

## License

[Apache License 2.0](LICENSE)
