Available CSS variables:
--color-primary - The primary color
--color-primary-rgb - The primary color in rgb

--color-secondary - The secondary color
--color-secondary-rgb - The secondary color in rgb

--color-background - Default background color
--color-background-rgb - Default background color in rgb

--color-background-highlight - Highlight background color
--color-background-highlight-rgb - Highlight background color in rgb

--transition-speed - Default transition speed
--transition-timing - Default transition timing
--transition - Default transition (speed + timing)


Note: for consitency please use for ex; "transition: color var(--transition)", also when a user has GPU rendering disabled, this will disable transitions when using var(--transition).