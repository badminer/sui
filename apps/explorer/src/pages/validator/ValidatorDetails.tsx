// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useGetRollingAverageApys, useGetValidatorsEvents } from '@mysten/core';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { ValidatorMeta } from '~/components/validator/ValidatorMeta';
import { ValidatorStats } from '~/components/validator/ValidatorStats';
import { useGetSystemObject } from '~/hooks/useGetObject';
import { Banner } from '~/ui/Banner';
import { LoadingSpinner } from '~/ui/LoadingSpinner';
import { getValidatorMoveEvent } from '~/utils/getValidatorMoveEvent';

function ValidatorDetails() {
    const { id } = useParams();
    const { data, isLoading } = useGetSystemObject();

    const validatorData = useMemo(() => {
        if (!data) return null;
        return data.activeValidators.find((av) => av.suiAddress === id) || null;
    }, [id, data]);

    const numberOfValidators = data?.activeValidators.length ?? null;
    const { data: rollingAverageApys, isLoading: validatorsApysLoading } =
        useGetRollingAverageApys(numberOfValidators);

    const { data: validatorEvents, isLoading: validatorsEventsLoading } =
        useGetValidatorsEvents({
            limit: numberOfValidators,
            order: 'descending',
        });

    const validatorRewards = useMemo(() => {
        if (!validatorEvents || !id) return 0;
        const rewards = getValidatorMoveEvent(
            validatorEvents.data,
            id
        )?.pool_staking_reward;
        return +rewards || 0;
    }, [id, validatorEvents]);

    if (isLoading || validatorsEventsLoading || validatorsApysLoading) {
        return (
            <div className="mb-10 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!validatorData || !data || !validatorEvents || !id) {
        return (
            <div className="mb-10 flex items-center justify-center">
                <Banner variant="error" spacing="lg" fullWidth>
                    No validator data found for {id}
                </Banner>
            </div>
        );
    }

    const apy = rollingAverageApys?.[id] || 0;
    const tallyingScore =
        validatorEvents?.data.find(
            ({ parsedJson }) => parsedJson?.validator_address === id
        )?.parsedJson?.tallying_rule_global_score || null;
    return (
        <div className="mb-10">
            <div className="flex flex-col flex-nowrap gap-5 md:flex-row md:gap-0">
                <ValidatorMeta validatorData={validatorData} />
            </div>
            <div className="mt-5 md:mt-8">
                <ValidatorStats
                    validatorData={validatorData}
                    epoch={data.epoch}
                    epochRewards={validatorRewards}
                    apy={apy}
                    tallyingScore={tallyingScore}
                />
            </div>
        </div>
    );
}

export { ValidatorDetails };
