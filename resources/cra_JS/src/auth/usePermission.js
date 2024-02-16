import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './useAuthContext';

// ----------------------------------------------------------------------
export function usePermission(pageId) {
    const navigate = useNavigate();

    const { user } = useAuthContext();

    const [userPermissions, setUserPermissions] = useState({});

    useEffect(() => {
        const permissions = user?.roles?.map(({ permissions }) => {
            return permissions;
        }, []);
        const permissionAllowed = checkPermissions(permissions);

        if (!permissionAllowed.isList) {
            navigate('/403');
        } else {
            setUserPermissions(permissionAllowed);
        }

    }, [user]);

    return userPermissions;
}

function checkPermissions(permissions) {
    const permissionAllowed = {
        isList: false,
        isCreate: false,
        isEdit: false,
        isDelete: false
    };

    permissions.forEach(rolePermissions => {
        rolePermissions.forEach(permission => {
            const permissionName = permission.name;
            permissionAllowed[`is${permissionName.split('-')[1].charAt(0).toUpperCase()}${permissionName.split('-')[1].slice(1)}`] = true;
        });
    });

    return permissionAllowed;
}
