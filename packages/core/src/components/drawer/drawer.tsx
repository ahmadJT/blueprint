/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from "classnames";
import * as React from "react";

import { type IconName, IconSize, SmallCross } from "@blueprintjs/icons";

import { Classes, type Props } from "../../common";
import * as Errors from "../../common/errors";
import { getPositionIgnoreAngles, isPositionHorizontal, type Position } from "../../common/position";
import { DISPLAYNAME_PREFIX, type MaybeElement } from "../../common/props";
import { Button } from "../button/buttons";
import { H4 } from "../html/html";
import { Icon } from "../icon/icon";
import type { BackdropProps, OverlayableProps } from "../overlay/overlayProps";
import { Overlay2 } from "../overlay2/overlay2";

export enum DrawerSize {
    SMALL = "360px",
    STANDARD = "50%",
    LARGE = "90%",
}

export interface DrawerProps extends OverlayableProps, BackdropProps, Props {
    /** Drawer contents. */
    children?: React.ReactNode;

    /**
     * Name of a Blueprint UI icon (or an icon element) to render in the
     * drawer's header. Note that the header will only be rendered if `title` is
     * provided.
     */
    icon?: IconName | MaybeElement;

    /**
     * Whether to show the close button in the dialog's header.
     * Note that the header will only be rendered if `title` is provided.
     *
     * @default true
     */
    isCloseButtonShown?: boolean;

    /**
     * Toggles the visibility of the overlay and its children.
     * This prop is required because the component is controlled.
     */
    isOpen: boolean;

    /**
     * Position of a drawer. All angled positions will be casted into pure positions
     * (top, bottom, left, or right).
     *
     * @default "right"
     */
    position?: Position;

    /**
     * CSS size of the drawer. This sets `width` if horizontal position (default)
     * and `height` otherwise.
     *
     * Constants are available for common sizes:
     * - `DrawerSize.SMALL = 360px`
     * - `DrawerSize.STANDARD = 50%`
     * - `DrawerSize.LARGE = 90%`
     *
     * @default DrawerSize.STANDARD = "50%"
     */
    size?: number | string;

    /**
     * CSS styles to apply to the dialog.
     *
     * @default {}
     */
    style?: React.CSSProperties;

    /**
     * Title of the dialog. If provided, an element with `Classes.DIALOG_HEADER`
     * will be rendered inside the dialog before any children elements.
     */
    title?: React.ReactNode;

    /**
     * Name of the transition for internal `CSSTransition`. Providing your own
     * name here will require defining new CSS transition properties.
     */
    transitionName?: string;
}

const defaultProps: Partial<DrawerProps> = {
    canOutsideClickClose: true,
    isOpen: false,
    position: "right",
    style: {},
};

export const Drawer: React.FC<DrawerProps> = props => {
    const {
        hasBackdrop,
        size,
        style,
        position,
        className,
        children,
        icon,
        title,
        isCloseButtonShown,
        onClose,
        ...overlayProps
    } = props;
    const realPosition = getPositionIgnoreAngles(position!);

    const classes = classNames(
        Classes.DRAWER,
        {
            [Classes.positionClass(realPosition) ?? ""]: true,
        },
        className,
    );

    const styleProp =
        size == null
            ? style
            : {
                  ...style,
                  [isPositionHorizontal(realPosition) ? "height" : "width"]: size,
              };

    const maybeRenderCloseButton = () => {
        return (
            isCloseButtonShown && (
                <Button
                    aria-label="Close"
                    className={Classes.DIALOG_CLOSE_BUTTON}
                    icon={<SmallCross size={IconSize.LARGE} />}
                    minimal={true}
                    onClick={onClose}
                />
            )
        );
    };

    const maybeRenderHeader = () => {
        return (
            title && (
                <div className={Classes.DRAWER_HEADER}>
                    <Icon icon={icon} size={IconSize.LARGE} />
                    <H4>{title}</H4>
                    {maybeRenderCloseButton()}
                </div>
            )
        );
    };

    React.useEffect(() => {
        if (title == null) {
            if (icon != null) {
                console.warn(Errors.DIALOG_WARN_NO_HEADER_ICON);
            }
            if (isCloseButtonShown != null) {
                console.warn(Errors.DIALOG_WARN_NO_HEADER_CLOSE_BUTTON);
            }
        }
        if (position != null && position !== getPositionIgnoreAngles(position)) {
            console.warn(Errors.DRAWER_ANGLE_POSITIONS_ARE_CASTED);
        }
    }, [icon, isCloseButtonShown, position, title]);

    return (
        // N.B. the `OVERLAY_CONTAINER` class is a bit of a misnomer since it is only being used by the Drawer
        // component, but we keep it for backwards compatibility.
        <Overlay2 {...overlayProps} className={classNames({ [Classes.OVERLAY_CONTAINER]: hasBackdrop })}>
            <div className={classes} style={styleProp}>
                {maybeRenderHeader()}
                {children}
            </div>
        </Overlay2>
    );
};

Drawer.displayName = `${DISPLAYNAME_PREFIX}.Drawer`;
Drawer.defaultProps = defaultProps;
